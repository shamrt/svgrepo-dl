# SVGRepo Downloader

A TypeScript tool to download SVG icons from [SVGRepo](https://www.svgrepo.com/) collections in bulk.

## Features

- 🚀 Download entire SVG collections or specific page ranges
- 📁 Automatic organization by collection (each collection gets its own folder)
- ⚙️ Environment-based configuration
- 🛡️ Safety checks to prevent overwriting existing downloads
- 📊 Progress tracking and error handling
- 🎯 Clean filename sanitization

## Quick Start

1. **Clone and install dependencies:**

   ```bash
   git clone <your-repo-url>
   cd svgrepo-dl
   npm install
   ```

2. **Set up your environment:**

   ```bash
   cp .env.sample .env
   ```

3. **Configure your collection in `.env`:**

   ```env
   COLLECTION_NAME="Twemoji Emojis"
   COLLECTION_SLUG="twemoji-emojis"
   COLLECTION_PAGE_START=1
   COLLECTION_PAGE_END=5
   OUTPUT_DIR="./public/vectors"
   ```

4. **Run the downloader:**
   ```bash
   npm start
   ```

## Configuration

The tool uses environment variables for configuration. Copy `.env.sample` to `.env` and customize:

| Variable                | Description                           | Example            | Required                         |
| ----------------------- | ------------------------------------- | ------------------ | -------------------------------- |
| `COLLECTION_NAME`       | Display name for the collection       | `"Twemoji Emojis"` | No                               |
| `COLLECTION_SLUG`       | URL slug from SVGRepo collection page | `"twemoji-emojis"` | **Yes**                          |
| `COLLECTION_PAGE_START` | First page to download                | `1`                | No (default: 1)                  |
| `COLLECTION_PAGE_END`   | Last page to download                 | `72`               | No (default: 1)                  |
| `OUTPUT_DIR`            | Base directory for downloads          | `"./downloads"`    | No (default: "./public/vectors") |

### Finding Collection Information

1. Go to [SVGRepo Collections](https://www.svgrepo.com/collections)
2. Find your desired collection
3. The URL will be: `https://www.svgrepo.com/collection/{COLLECTION_SLUG}`
4. Check the pagination to determine the total number of pages

**Example URLs:**

- Twemoji Emojis: `https://www.svgrepo.com/collection/twemoji-emojis`
- Bootstrap Icons: `https://www.svgrepo.com/collection/bootstrap-icons`
- Feather Icons: `https://www.svgrepo.com/collection/feather-icons`

## Output Structure

Files are automatically organized by collection:

```
📁 {OUTPUT_DIR}/
└── 📁 {COLLECTION_SLUG}/
    ├── 📄 icon_1.svg
    ├── 📄 icon_2.svg
    └── 📄 ...
```

**Example:**

```
📁 public/vectors/
└── 📁 twemoji-emojis/
    ├── 📄 grinning_face.svg
    ├── 📄 heart_eyes.svg
    └── 📄 thumbs_up.svg
```

## Usage Examples

### Download entire collection

```env
COLLECTION_SLUG="twemoji-emojis"
COLLECTION_PAGE_START=1
COLLECTION_PAGE_END=72
```

### Download specific pages (testing)

```env
COLLECTION_SLUG="bootstrap-icons"
COLLECTION_PAGE_START=1
COLLECTION_PAGE_END=3
```

### Resume from specific page

```env
COLLECTION_SLUG="feather-icons"
COLLECTION_PAGE_START=10
COLLECTION_PAGE_END=25
```

## Safety Features

- ⚠️ **Directory Protection**: Script exits if output directory already exists
- 🔄 **Error Handling**: Individual file failures don't stop the entire process
- 📝 **Clear Logging**: Progress updates and error reporting
- ✅ **Validation**: Environment variable validation before starting

## Development

### Scripts

```bash
npm start          # Run the downloader
```

## Troubleshooting

### Common Issues

**"COLLECTION_SLUG environment variable is required"**

- Make sure you've copied `.env.sample` to `.env`
- Verify `COLLECTION_SLUG` is set in your `.env` file

**"Output directory already exists"**

- The tool prevents overwriting existing downloads
- Either remove the existing directory or change the collection slug/output path

**"Failed to fetch" errors**

- Check your internet connection
- Verify the collection slug is correct
- Some collections might have fewer pages than expected

**"Permission denied" when creating directories**

- Ensure you have write permissions to the output directory
- Try using a different output path

### Getting Help

1. Check that your `.env` file matches the `.env.sample` format
2. Verify the collection exists on SVGRepo
3. Test with a small page range first (e.g., pages 1-2)

## Credits

This project borrows heavily from the original script by [@alanrsoares](https://github.com/alanrsoares).

- Original gist: https://gist.github.com/alanrsoares/2a8eb5688c32e611b9757071a2d5f027

## License

MIT License - see package.json for details.
