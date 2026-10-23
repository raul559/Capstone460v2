const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "..",
  "..",
  "apps",
  "web-v1",
  "src",
  "pages",
  "Upload.jsx",
);
let content = fs.readFileSync(filePath, "utf8");

const oldFunction = `  function handleSubmit(e) {
    e.preventDefault();

    if (!canAnalyze) {
      setFormMsg("Please complete required fields, consent, and add at least 1 image.");
      return;
    }

    // Demo analysis (matches your current "Preliminary Analysis (demo)" idea)
    const now = new Date();
    const meta = \`\${files.length} image(s) • \${now.toLocaleString()}\`;

    const tags = [
      \`Age: \${form.age}\`,
      \`Skin type: \${form.skinType}\`,
      \`Location: \${form.location}\`,
      \`Duration: \${form.duration} day(s)\`,
    ];

    setResult({ meta, tags });
    setFormMsg("");
  }`;

const newFunction = `  async function handleSubmit(e) {
    e.preventDefault();

    if (!canAnalyze) {
      setFormMsg("Please complete required fields, consent, and add at least 1 image.");
      return;
    }

    setFormMsg("Uploading...");

    try {
      // Upload each file to the server
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("patientInfo", JSON.stringify({
          name: form.name,
          age: form.age,
          sex: form.sex,
          skinType: form.skinType,
          location: form.location,
          duration: form.duration,
          uploadDate: new Date().toISOString(),
        }));

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(\`Failed to upload \${file.name}\`);
        }

        return await response.json();
      });

      const results = await Promise.all(uploadPromises);

      // Demo analysis result
      const now = new Date();
      const meta = \`\${files.length} image(s) uploaded • \${now.toLocaleString()}\`;

      const tags = [
        \`Age: \${form.age}\`,
        \`Skin type: \${form.skinType}\`,
        \`Location: \${form.location}\`,
        \`Duration: \${form.duration} day(s)\`,
      ];

      setResult({ meta, tags });
      setFormMsg(\`✓ Successfully uploaded \${results.length} image(s) to database\`);
    } catch (error) {
      console.error("Upload error:", error);
      setFormMsg(\`Error: \${error.message}\`);
      setResult(null);
    }
  }`;

content = content.replace(oldFunction, newFunction);
fs.writeFileSync(filePath, content, "utf8");

console.log("Upload.jsx updated successfully!");
