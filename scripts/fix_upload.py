import re

# Read the file
with open('apps/web-v1/src/pages/Upload.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the handleSubmit function
old_pattern = r'  function handleSubmit\(e\) \{[\s\S]*?    setFormMsg\(""\);\s*\}'

new_function = '''  async function handleSubmit(e) {
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
          const error = await response.json();
          throw new Error(error.error || `Failed to upload ${file.name}`);
        }

        return await response.json();
      });

      const results = await Promise.all(uploadPromises);

      // Demo analysis result
      const now = new Date();
      const meta = `${files.length} image(s) uploaded • ${now.toLocaleString()}`;

      const tags = [
        `Age: ${form.age}`,
        `Skin type: ${form.skinType}`,
        `Location: ${form.location}`,
        `Duration: ${form.duration} day(s)`,
      ];

      setResult({ meta, tags });
      setFormMsg(`✓ Successfully uploaded ${results.length} image(s) to database`);
    } catch (error) {
      console.error("Upload error:", error);
      setFormMsg(`Error: ${error.message}`);
      setResult(null);
    }
  }'''

# Replace
content = re.sub(old_pattern, new_function, content)

# Write back
with open('apps/web-v1/src/pages/Upload.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Upload.jsx updated successfully!")
