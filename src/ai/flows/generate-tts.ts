'use server';
/**
 * @fileOverview A flow to convert text to speech using Gemini TTS.
 *
 * - generateTts - A function to generate audio from text.
 * - GenerateTtsInput - The input type for the generateTts function.
 * - GenerateTtsOutput - The return type for the generateTts function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import wav from 'wav';

const GenerateTtsInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
  speaker: z.string().describe('The speaker to use for the voice.'),
});
export type GenerateTtsInput = z.infer<typeof GenerateTtsInputSchema>;

const GenerateTtsOutputSchema = z.object({
  media: z.string().describe("The generated audio as a base64 encoded data URI in WAV format."),
});
export type GenerateTtsOutput = z.infer<typeof GenerateTtsOutputSchema>;

export async function generateTts(input: GenerateTtsInput): Promise<GenerateTtsOutput> {
  return generateTtsFlow(input);
}

// Helper to convert raw PCM audio buffer to a base64 WAV string
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d: Buffer) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

const generateTtsFlow = ai.defineFlow(
  {
    name: 'generateTtsFlow',
    inputSchema: GenerateTtsInputSchema,
    outputSchema: GenerateTtsOutputSchema,
  },
  async ({text, speaker}) => {
    const {media} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // Prebuilt voices are used here.
            prebuiltVoiceConfig: {voiceName: speaker},
          },
        },
      },
      prompt: text,
    });

    if (!media || !media.url) {
      throw new Error('No audio media was returned from the TTS model.');
    }

    // The data URI is base64-encoded PCM audio.
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    // Convert the raw PCM audio to a WAV file format.
    const wavBase64 = await toWav(audioBuffer);

    return {
      media: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
