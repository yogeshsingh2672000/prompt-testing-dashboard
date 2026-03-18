export interface BedrockModel {
    id: string;
    name: string;
    provider: string;
    pricing: {
        inputPer1M: number;
        outputPer1M: number;
    };
}

export const SUPPORTED_MODELS: BedrockModel[] = [
    {
        id: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        pricing: {
            inputPer1M: 3.00,
            outputPer1M: 15.00
        }
    },
    {
        id: 'anthropic.claude-3-sonnet-20240229-v1:0',
        name: 'Claude 3 Sonnet',
        provider: 'Anthropic',
        pricing: {
            inputPer1M: 3.00,
            outputPer1M: 15.00
        }
    },
    {
        id: 'anthropic.claude-3-opus-20240229-v1:0',
        name: 'Claude 3 Opus',
        provider: 'Anthropic',
        pricing: {
            inputPer1M: 15.00,
            outputPer1M: 75.00
        }
    },
    {
        id: 'anthropic.claude-3-haiku-20240307-v1:0',
        name: 'Claude 3 Haiku',
        provider: 'Anthropic',
        pricing: {
            inputPer1M: 0.25,
            outputPer1M: 1.25
        }
    }
];

export const DEFAULT_MODEL_ID = SUPPORTED_MODELS[1].id; // Claude 3 Sonnet
