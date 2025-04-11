# Xbeats MCP Server

A Model Context Protocol (MCP) server for downloading music tracks.

## Available Tools

### download_track

Search and download a music track by query.

**Parameters:**

- `query` (string): Search query for the track

**Example:**

```json
{
  "query": "Faded"
}
```

# Usage with Claude Desktop

### Setup

Add this to your cline_mcp_settings.json:

#### NPX

```json
{
  "mcpServers": {
    "xbeats-mcp": {
      "command": "npx",
      "args": ["-y", "xbeats-mcp"]
    }
  }
}
```

#### NPX with custom setting

The server can be configured using the following environment variables:

```json
{
  "mcpServers": {
    "xbeats-mcp": {
      "command": "npx",
      "args": ["-y", "xbeats-mcp"],
      "env": {
        "DOWNLOADS_PATH": "/path/to/custom/downloads"
      }
    }
  }
}
```

## Configuration

Set the `DOWNLOADS_PATH` environment variable to specify where downloaded tracks should be saved.
