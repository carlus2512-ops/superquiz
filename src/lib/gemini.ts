import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateQuestions(categoryName: string, themeName: string, difficulty: string, count: number) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Gere ${count} perguntas variadas para um quiz sobre a categoria "${categoryName}" e o tema "${themeName}".
    A dificuldade das perguntas deve ser: ${difficulty.toUpperCase()}.
    As perguntas devem ser desafiadoras, mas justas e adequadas ao nível de dificuldade solicitado.
    
    Inclua uma variedade de formatos de perguntas, como:
    1. Múltipla Escolha (4 opções)
       Exemplo: "Qual é a capital da França?" Opções: ["Londres", "Paris", "Berlim", "Madri"]. Resposta: "Paris".
    2. Verdadeiro ou Falso (2 opções)
       Exemplo: "A água ferve a 100 graus Celsius ao nível do mar." Opções: ["Verdadeiro", "Falso"]. Resposta: "Verdadeiro".
    3. Preencha a Lacuna (4 opções de palavras para preencher)
       Exemplo: "O elemento químico com símbolo 'O' é o ______." Opções: ["Ouro", "Oxigênio", "Ósmio", "Oganessônio"]. Resposta: "Oxigênio".

    Para cada pergunta, forneça as opções de resposta adequadas ao formato, a resposta correta (que deve ser exatamente igual a uma das opções) e uma breve explicação do porquê a resposta está correta.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: "O texto da pergunta.",
            },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: "Lista de opções de resposta (2 para Verdadeiro/Falso, 4 para múltipla escolha ou preencha a lacuna).",
            },
            correct_answer: {
              type: Type.STRING,
              description: "A resposta correta (deve ser exatamente igual a uma das opções).",
            },
            explanation: {
              type: Type.STRING,
              description: "Explicação da resposta correta.",
            },
          },
          required: ["text", "options", "correct_answer", "explanation"],
        }
      },
    },
  });

  const jsonStr = response.text?.trim();
  if (!jsonStr) throw new Error("Falha ao gerar perguntas");
  return JSON.parse(jsonStr);
}
