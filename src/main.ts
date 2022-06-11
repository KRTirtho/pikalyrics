import fastify from "fastify";
import vosk, { RecognizerResult } from "vosk";
import fs from "fs/promises";
import fss from "fs";
import path from "path";
import wav from "wav";
import { Readable } from "stream";
import { stringifySync, NodeList } from "subtitle";
import ffmpeg from "fluent-ffmpeg";
import axios from "axios";
import youtubedl from "youtube-dl-exec";

const app = fastify();

const model = new vosk.Model("model");
const WORDS_PER_LINE = 7;

app.post("/", async (request, res) => {
	try {
		const videoURL = (request.body as any).url as string | null;
		if (!videoURL) return res.send("No video URL provided");

		const videoId = videoURL.split("?v=")[1];

		const videoRes = await youtubedl(videoURL, {
			referer: videoURL,
			audioFormat: "wav",
			extractAudio: true,
			noCheckCertificate: true,
			callHome: false,
			quiet: true,
			output: "~/dev/pikal1yrics/%(id)s.%(ext)s",
		});
		console.log(videoRes);
	} catch (error) {
		console.error("[Error] [POST /]", error);
	}

	// const reader = new wav.Reader();
	// const readerCopy = new Readable().wrap(reader);

	// const ffmpegOutStream = ffmpeg({ source: localFilePathStr })
	// 	.inputFormat("mp3")
	// 	.audioChannels(1)
	// 	.audioFrequency(44100)
	// 	.audioBitrate(128)
	// 	.audioCodec("pcm_s16le")
	// 	.toFormat("wav")
	// 	.writeToStream(reader);

	// const results: RecognizerResult[] = [];
	// const subs: NodeList = [];

	// reader.on("format", async ({ channels, audioFormat, sampleRate }) => {
	// 	const rec = new vosk.Recognizer({ model, sampleRate });
	// 	try {
	// 		if (audioFormat != 1 || channels != 1) {
	// 			console.error("Audio file must be WAV format mono PCM.");
	// 			process.exit(1);
	// 		}
	// 		rec.setMaxAlternatives(10);
	// 		rec.setWords(true);
	// 		rec.setPartialWords(true);
	// 		// iterating over the chunks of the audio file
	// 		// equivalent of reader.of("chunk", ...)
	// 		for await (const data of readerCopy) {
	// 			const endOfSpeech = await rec.acceptWaveformAsync(data);
	// 			if (endOfSpeech) {
	// 				results.push(rec.result());
	// 			} else {
	// 				results.push(rec.finalResult());
	// 			}
	// 		}
	// 	} catch (error) {
	// 		console.error("[Wav.Reader.onFormat]", error);
	// 	} finally {
	// 		rec.free();
	// 	}
	// });

	// ffmpegOutStream.on("finish", () => {
	// 	model.free();
	// 	results.forEach((element) => {
	// 		if (!element.hasOwnProperty("result")) return;
	// 		const words = element.result;
	// 		if (words.length == 1) {
	// 			subs.push({
	// 				type: "cue",
	// 				data: {
	// 					start: words[0].start * 1000,
	// 					end: words[0].end * 1000,
	// 					text: words[0].word,
	// 				},
	// 			});
	// 			return;
	// 		}
	// 		var start_index = 0;
	// 		var text = words[0].word + " ";
	// 		for (let i = 1; i < words.length; i++) {
	// 			text += words[i].word + " ";
	// 			if (i % WORDS_PER_LINE == 0) {
	// 				subs.push({
	// 					type: "cue",
	// 					data: {
	// 						start: words[start_index].start * 1000,
	// 						end: words[i].end * 1000,
	// 						text: text.slice(0, text.length - 1),
	// 					},
	// 				});
	// 				start_index = i;
	// 				text = "";
	// 			}
	// 		}
	// 		if (start_index != words.length - 1)
	// 			subs.push({
	// 				type: "cue",
	// 				data: {
	// 					start: words[start_index].start * 1000,
	// 					end: words[words.length - 1].end * 1000,
	// 					text: text,
	// 				},
	// 			});
	// 	});
	// 	console.log(stringifySync(subs, { format: "SRT" }));
	// });
});

app.listen({ port: 3000 });
