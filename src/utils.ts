import axios from "axios";
import Crypto from "crypto-js";
import fs from "node:fs";
import path from "node:path"
import { fileURLToPath } from "node:url";
export type Quality = string | { quality: string; link: string }[];
/**
 * Checks if directory exists and creates it if it doesn't
 * @param dirPath The directory path to check/create
 */
export function checkAndCreateDirectory(dirPath: string = path.join(path.dirname(fileURLToPath(import.meta.url)), "downloads")): string {
    try {
        // Resolve the path to absolute path
        const absolutePath = path.resolve(dirPath);

        // Check if directory exists
        if (!fs.existsSync(absolutePath)) {
            // Create directory recursively (including parent directories if needed)
            fs.mkdirSync(absolutePath, { recursive: true });
        }

        return absolutePath;
    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'An unknown error occurred');
    }
    return dirPath;
}
/**
 * Utility function to create download links for different qualities
 *
 * @param encryptedMediaUrl - Encrypted media url
 * @returns Download links for different qualities
 */
export function createDownloadLinks(encryptedMediaUrl: string): Quality {
    const qualities = [
        { id: "_12", bitrate: "12kbps" },
        { id: "_48", bitrate: "48kbps" },
        { id: "_96", bitrate: "96kbps" },
        { id: "_160", bitrate: "160kbps" },
        { id: "_320", bitrate: "320kbps" },
    ];

    const key = "38346591";
    const decrypted = Crypto.DES.decrypt(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        { ciphertext: Crypto.enc.Base64.parse(encryptedMediaUrl) },
        Crypto.enc.Utf8.parse(key),
        { mode: Crypto.mode.ECB }
    );

    const decryptedLink = decrypted.toString(Crypto.enc.Utf8);

    for (const q of qualities) {
        if (decryptedLink.includes(q.id)) {
            return qualities.map(({ id, bitrate }) => ({
                quality: bitrate,
                link: decryptedLink.replace(q.id, id),
            }));
        }
    }

    return decryptedLink;
}


/**
 * Downloads a file from a URL to a specified local path
 * @param url - The URL of the file to download
 * @param destinationPath - The local path where the file should be saved
 * @returns Promise that resolves when download is complete or rejects on error
 */
export async function downloadFile(url: string, destinationPath: string = path.join(process.cwd(), "song.mp3")): Promise<void> {
    try {
        // Ensure the directory exists
        const dir = path.dirname(destinationPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Make the HTTP request with responseType set to stream
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
        });

        // Create a write stream to save the file
        const writer = fs.createWriteStream(destinationPath);

        // Pipe the response data to the file
        response.data.pipe(writer);

        // Return a promise that resolves when the download is complete
        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                writer.close();
                resolve();
            });

            writer.on('error', (error) => {
                writer.close();
                reject(error);
            });

            response.data.on('error', (error: Error) => {
                writer.close();
                reject(error);
            });
        });
    } catch (error) {
        throw new Error(`Failed to download file: ${error instanceof Error ? error.message : String(error)}`);
    }
}