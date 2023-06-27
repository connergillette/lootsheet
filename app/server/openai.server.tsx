import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration)

export const fetchTopicSummary = async (topicNotes: string[]) => {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ 
        role: "user",
        content: `\
          Please combine my following notes (which are in reverse chronological order), without adding or omitting any details:\
          ${
            topicNotes.join('\n')
          }
        `
      }],
    })
  
    return response.data.choices[0].message.content
  } catch (e) {
    console.log(e)
  }
}
