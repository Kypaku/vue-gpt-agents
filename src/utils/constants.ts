export const GPT_35_TURBO = "gpt-3.5-turbo-1106";
export const GPT_4 = "gpt-4-1106-preview";
export const GPT_MODEL_NAMES = [GPT_35_TURBO, GPT_4];

export const DEFAULT_MAX_LOOPS_FREE = 30;
export const DEFAULT_MAX_LOOPS_PAID = 160;
export const DEFAULT_MAX_LOOPS_CUSTOM_API_KEY = 500;

export enum AgentCommands {
    "NEED_FILE_SYSTEM" = "NEED_FILE_SYSTEM",
    "NEED_FILE_CONTENT" = "NEED_FILE_CONTENT",
    "WRITE_FILE_CONTENT" = "WRITE_FILE_CONTENT",
    "NEED_URL_CONTENT" = "NEED_URL_CONTENT",
    "INPUT" = "INPUT",
    "TESTS" = "TESTS",
}
