import { useState, useEffect } from "react";
import { FaCopy, FaCheck } from "react-icons/fa";
import "./App.css";

function App() {
  const [pageUrl, setPageUrl] = useState("https://example.com/my-page");
  const [title, setTitle] = useState("hits");
  const [titleBg, setTitleBg] = useState("#555555");
  const [countBg, setCountBg] = useState("#44cc11");
  const [edgeFlat, setEdgeFlat] = useState(false);
  const [badgeImageUrl, setBadgeImageUrl] = useState("");
  const [markdownCode, setMarkdownCode] = useState("");
  const [htmlCode, setHtmlCode] = useState("");
  const [markdownCopied, setMarkdownCopied] = useState(false);
  const [htmlCopied, setHtmlCopied] = useState(false);

  // Get base server URL based on environment
  const getServerUrl = () => {
    // For GitHub Codespaces
    if (window.location.hostname.includes("app.github.dev")) {
      return `https://${window.location.hostname.replace("3000", "3001")}`;
    }
    // For local development
    return "http://localhost:3001";
  };

  const serverUrl = getServerUrl();

  useEffect(() => {
    const queryParams = new URLSearchParams({
      url: pageUrl,
      title: title,
      title_bg: titleBg,
      count_bg: countBg,
      edge_flat: edgeFlat,
    });

    // Use absolute URLs to ensure they work when embedded on other pages
    const previewImageUrl = `${serverUrl}/api/count/keep/badge.svg?${queryParams.toString()}`;
    const liveImageUrl = `${serverUrl}/api/count/incr/badge.svg?${queryParams.toString()}`;

    setBadgeImageUrl(previewImageUrl);

    // Generate markdown and HTML code with absolute URLs
    setMarkdownCode(`[![${title}](${liveImageUrl})](${pageUrl})`);
    // Include crossorigin attribute to allow proper CORS handling
    setHtmlCode(
      `<a href="${pageUrl}"><img src="${liveImageUrl}" alt="${title}" crossorigin="anonymous" /></a>`,
    );
  }, [pageUrl, title, titleBg, countBg, edgeFlat, serverUrl]);

  const handleCopy = (text, setterFunction) => {
    navigator.clipboard.writeText(text);
    setterFunction(true);
    setTimeout(() => setterFunction(false), 1500);
  };

  // Helper to normalize 3-digit hex to 6-digit
  const normalizeHex = (hex) => {
    if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
      return "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    return hex;
  };

  return (
    <div className="App">
      <header className="App-header section-container">
        <h1>Page View Counter Badge Generator</h1>
      </header>
      <main className="App-content">
        <div className="controls section-container">
          <div className="control-group">
            <label htmlFor="page-url">Page URL: </label>
            <input
              id="page-url"
              type="text"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
              placeholder="https://your-site.com/page"
              className="full-width-input"
            />
          </div>

          <div className="control-group">
            <label htmlFor="badge-title">Badge Title: </label>
            <input
              id="badge-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="full-width-input"
            />
          </div>

          <div className="control-group">
            <label htmlFor="title-bg-color">Title Background Color: </label>
            <input
              id="title-bg-color"
              type="color"
              value={titleBg}
              onChange={(e) => setTitleBg(normalizeHex(e.target.value))}
            />
          </div>

          <div className="control-group">
            <label htmlFor="count-bg-color">Count Background Color: </label>
            <input
              id="count-bg-color"
              type="color"
              value={countBg}
              onChange={(e) => setCountBg(normalizeHex(e.target.value))}
            />
          </div>

          <div className="control-group checkbox">
            <label htmlFor="edge-flat">
              <input
                id="edge-flat"
                type="checkbox"
                checked={edgeFlat}
                onChange={(e) => setEdgeFlat(e.target.checked)}
              />{" "}
              Use flat edges
            </label>
          </div>
        </div>

        <div className="preview-section section-container">
          <h2>Badge Preview</h2>
          <div className="badge-preview section-container">
            <img src={badgeImageUrl} alt="Badge Preview" />
          </div>

          <h3>Markdown Code</h3>
          <div className="code-container section-container">
            <pre className="code-block">{markdownCode}</pre>
            <button
              className={`copy-button ${markdownCopied ? "copied" : ""}`}
              onClick={() => handleCopy(markdownCode, setMarkdownCopied)}
              aria-label="Copy Markdown code to clipboard"
              title="Copy to clipboard"
            >
              {markdownCopied ? <FaCheck /> : <FaCopy />}
            </button>
          </div>

          <h3>HTML Code</h3>
          <div className="code-container section-container">
            <pre className="code-block">{htmlCode}</pre>
            <button
              className={`copy-button ${htmlCopied ? "copied" : ""}`}
              onClick={() => handleCopy(htmlCode, setHtmlCopied)}
              aria-label="Copy HTML code to clipboard"
              title="Copy to clipboard"
            >
              {htmlCopied ? <FaCheck /> : <FaCopy />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
