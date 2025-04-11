#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { checkAndCreateDirectory, createDownloadLinks, downloadFile } from "./utils.js";

const server = new McpServer({
    name: "xbeats-mcp",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {
        },
    },
});
server.tool("download_track", "Search track from the given query and downloads it", {
    query: z.string().describe("Search query for the track"),

}, async ({ query }) => {
    const DOWNLOADS_PATH = checkAndCreateDirectory(process.env.DOWNLOADS_PATH);
    const url = `https://www.jiosaavn.com/api.php?p=1&q=${encodeURIComponent(query)}&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=1&__call=search.getResults`;

    try {
        const resposne = await fetch(url);
        if (!resposne.ok) {
            return {
                content: [{
                    type: "text", text: "Failed to retrive track"
                }]
            }
        }
        const data = await resposne.json();
        const track = data.results[0];
        const trackDownloadLinks = createDownloadLinks(track.more_info?.encrypted_media_url);
        if (trackDownloadLinks.length === 0) {
            return {
                content: [{
                    type: "text", text: "Failed to retrive download links for track"
                }]
            }
        }
        const downloadLink = trackDownloadLinks === "string" ? trackDownloadLinks : trackDownloadLinks[trackDownloadLinks.length - 1].link as string
        const downloadPath = DOWNLOADS_PATH + "/" + track.title + ".mp3"
        await downloadFile(downloadLink, downloadPath);
        return { content: [{ type: "text", text: `Download success: ${downloadPath}` }] }

    } catch (error) {
        return { content: [{ type: "text", text: "Failed to download the track" }] }
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Xbeats MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});