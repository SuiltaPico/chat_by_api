export const api_base_url = {
  OpenAI: "https://api.openai.com/v1",
  API2D: "https://oa.api2d.net/v1",
};

export const openai_models = {
  chat_completions: [
    "gpt-4",
    // "gpt-4-0314",
    // "gpt-4-32k",
    // "gpt-4-32k-0314",
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-0301",
  ],
  completions: [
    "text-davinci-003",
    "text-davinci-002",
    "text-curie-001",
    "text-babbage-001",
    "text-ada-001",
  ],
  edits: ["text-davinci-edit-001", "code-davinci-edit-001"],
  audio_transcriptions: ["whisper-1"],
  audio_translations: ["whisper-1"],
  fine_tunes: ["davinci", "curie", "babbage", "ada"],
  embeddings: ["text-embedding-ada-002", "text-search-ada-doc-001"],
  moderations: ["text-moderation-stable", "text-moderation-latest"],
} as const;
