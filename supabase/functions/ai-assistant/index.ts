import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LawArticle {
  id: string;
  article_number: string;
  title: string | null;
  content: string;
  law?: { title: string; category: string } | null;
}

function log(label: string, value: unknown) {
  const safe = typeof value === "string" ? value.slice(0, 500) : String(value).slice(0, 500);
  console.log(`[ai-assistant] ${label}: ${safe}`);
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function buildLocalAnswer(articles: LawArticle[]): { answer: string; lawTitle: string } {
  const topArticle = articles[0];
  if (!topArticle) {
    return {
      answer: "لم أجد مواد قانونية مطابقة لسؤالك في قاعدة بيانات SANAD. يمكنك تجربة سؤال آخر أو التواصل مع محامٍ معتمد.\n\n*ملاحظة: هذه المعلومات للأغراض التثقيفية ولا تغني عن استشارة محامٍ مختص.*",
      lawTitle: "",
    };
  }

  const lawTitle = topArticle.law?.title || "";
  let answer = `بناءً على تحليل سؤالك، إليك ما تنص عليه المواد القانونية:\n\n`;
  answer += `**المادة ${topArticle.article_number}**`;
  if (topArticle.title) answer += ` — ${topArticle.title}`;
  answer += `:\n${topArticle.content}\n\n`;
  answer += `**المصدر:** ${lawTitle}\n\n`;
  if (articles.length > 1) {
    answer += `**مواد مشابهة ذات صلة:**\n`;
    articles.slice(1, 4).forEach((a) => {
      answer += `• المادة ${a.article_number}${a.title ? ` — ${a.title}` : ""}: ${a.content.slice(0, 100)}...\n`;
    });
  }
  answer += `\n*ملاحظة: هذه المعلومات للأغراض التثقيفية ولا تغني عن استشارة محامٍ مختص.*`;
  return { answer, lawTitle };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const body = await req.json();
    const question = body?.question;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      log("ERROR", "Missing or invalid question");
      return jsonResponse({ error: "السؤال مطلوب" }, 400);
    }

    log("Incoming question", question);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      log("ERROR", "Missing Supabase environment variables");
      return jsonResponse({ error: "خطأ في إعدادات الخادم" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch relevant law articles from the database
    const stopWords = ["ما", "ماذا", "كيف", "متى", "أين", "هل", "في", "من", "على", "عن", "هي", "هو", "أن", "إن", "ال", "و", "أو", "ثم", "السلام", "عليكم", "شرح", "اشرح", "عقوبة", "أسجل", "سجل"];
    const keywords = question
      .replace(/[؟?.,،!]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.includes(w));

    log("Extracted keywords", keywords.join(", "));

    let articles: LawArticle[] = [];

    if (keywords.length > 0) {
      const { data, error } = await supabase
        .from("law_articles")
        .select("*, law:laws(*)")
        .or(`content.ilike.%${keywords[0]}%`)
        .limit(5);

      if (error) {
        log("DB query error (first keyword)", error.message);
      } else if (data) {
        articles = data as LawArticle[];
      }

      if (articles.length === 0 && keywords.length > 1) {
        const orQuery = keywords.map((k) => `content.ilike.%${k}%`).join(",");
        const result = await supabase
          .from("law_articles")
          .select("*, law:laws(*)")
          .or(orQuery)
          .limit(5);
        if (result.error) {
          log("DB query error (all keywords)", result.error.message);
        } else if (result.data) {
          articles = result.data as LawArticle[];
        }
      }
    }

    log("Matched articles count", String(articles.length));
    if (articles.length > 0) {
      log("Top article", `المادة ${articles[0].article_number} — ${articles[0].law?.title || "غير محدد"}`);
    }

    // Build law context for the AI
    const lawContext = articles
      .map((a) => {
        const lawTitle = a.law?.title || "غير محدد";
        return `المادة ${a.article_number}${a.title ? ` — ${a.title}` : ""} من ${lawTitle}:\n${a.content}`;
      })
      .join("\n\n");

    log("Law context length", `${lawContext.length} chars`);

    const apiKey = Deno.env.get("AI_API_KEY");

    // If no API key is configured, use local fallback
    if (!apiKey || apiKey.trim().length === 0) {
      log("INFO", "No AI_API_KEY configured — using local fallback");
      const { answer, lawTitle } = buildLocalAnswer(articles);
      log("Execution time", `${Date.now() - startTime}ms`);
      return jsonResponse({ answer, articles, lawTitle });
    }

    // Build strict system prompt — no hallucination allowed
    const systemPrompt = `أنت SANAD AI Legal Assistant — مساعد قانوني يمني ذكي.
تجيب على أسئلة المستخدمين باللغة العربية فقط.

قواعد صارمة:
1. تجيب فقط بناءً على المواد القانونية الموجودة في قاعدة بيانات SANAD.
2. لا تستخدم معرفتك العامة أبداً. لا تختلق قوانين أو مواد غير موجودة.
3. اذكر دائماً رقم المادة والمصدر عند الاقتباس.
4. إذا لم توجد مواد قانونية مطابقة في قاعدة البيانات، قل بوضوح: "لم أجد مرجعاً قانونياً في قاعدة بيانات SANAD."
5. لا تخمن ولا تستنتج من معلومات خارجية.
6. أضف في نهاية إجابتك: "هذه المعلومات للأغراض التثقيفية ولا تغني عن استشارة محامٍ مختص."

${lawContext ? `المواد القانونية ذات الصلة من قاعدة بيانات SANAD:\n\n${lawContext}` : "لا توجد مواد قانونية مطابقة في قاعدة بيانات SANAD لهذا السؤال."}`;

    log("Prompt length", `${systemPrompt.length} chars`);
    log("INFO", "Calling AI provider...");

    let aiResponse: Response;
    try {
      aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });
    } catch (fetchErr) {
      log("ERROR", `Network error calling AI provider: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`);
      log("INFO", "Falling back to local response");
      const { answer, lawTitle } = buildLocalAnswer(articles);
      log("Execution time", `${Date.now() - startTime}ms`);
      return jsonResponse({ answer, articles, lawTitle });
    }

    log("Provider response status", String(aiResponse.status));

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      log("Provider error body", errText);

      let errorType = "خطأ في الاتصال بالمساعد الذكي";
      if (aiResponse.status === 401) errorType = "مفتاح API غير صالح";
      else if (aiResponse.status === 404) errorType = "النموذج المطلوب غير متاح";
      else if (aiResponse.status === 429) errorType = "تم تجاوز حد الاستخدام. يرجى المحاولة لاحقاً";
      else if (aiResponse.status >= 500) errorType = "خادم الذكاء الاصطناعي غير متاح حالياً";

      log("INFO", `AI provider failed (${aiResponse.status}) — falling back to local response`);

      // Graceful fallback — never return an error to the user
      const { answer, lawTitle } = buildLocalAnswer(articles);
      log("Execution time", `${Date.now() - startTime}ms`);
      return jsonResponse({ answer, articles, lawTitle });
    }

    let aiData: { choices?: Array<{ message?: { content?: string } }> };
    try {
      aiData = await aiResponse.json();
    } catch (parseErr) {
      log("ERROR", `JSON parse error: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
      log("INFO", "Falling back to local response");
      const { answer, lawTitle } = buildLocalAnswer(articles);
      log("Execution time", `${Date.now() - startTime}ms`);
      return jsonResponse({ answer, articles, lawTitle });
    }

    const rawAnswer = aiData.choices?.[0]?.message?.content;

    // Validate the AI response
    if (!rawAnswer || typeof rawAnswer !== "string" || rawAnswer.trim().length === 0) {
      log("ERROR", "AI returned empty or invalid response");
      log("INFO", "Falling back to local response");
      const { answer, lawTitle } = buildLocalAnswer(articles);
      log("Execution time", `${Date.now() - startTime}ms`);
      return jsonResponse({ answer, articles, lawTitle });
    }

    log("Returned answer length", `${rawAnswer.length} chars`);
    log("Execution time", `${Date.now() - startTime}ms`);

    return jsonResponse({
      answer: rawAnswer,
      articles,
      lawTitle: articles[0]?.law?.title || "",
    });
  } catch (err) {
    log("FATAL", `Edge function error: ${err instanceof Error ? err.message : String(err)}`);
    return jsonResponse(
      { error: "حدث خطأ غير متوقع في معالجة سؤالك. يرجى المحاولة مرة أخرى." },
      500,
    );
  }
});
