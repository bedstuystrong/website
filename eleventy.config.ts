import path from "node:path";
import { defineConfig } from "11ty.ts";
import Image from "@11ty/eleventy-img";

export default defineConfig((eleventyConfig) => {
  const outputDir = "public";
  eleventyConfig.setOutputDirectory(outputDir);

  eleventyConfig.addPassthroughCopy({ static: "/" });
  // eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

  eleventyConfig.setLiquidOptions({
    strictVariables: true,
    lenientIf: true,
    dynamicPartials: false,
  });
  eleventyConfig.setLiquidParameterParsing("builtin");

  eleventyConfig.addGlobalData("layout", "layout.html.liquid");

  const imageOptions: Image.PluginOptions = {
    outputDir: outputDir,
    urlPath: "/",
    filenameFormat: function (id, src, width, format, options) {
      const extension = path.extname(src);
      const name = path.basename(src, extension);
      return `${name}-${width}.${format}`;
    },
  };
  eleventyConfig.addShortcode("image", async function (src, alt, width, style) {
    const source = path.join(eleventyConfig.dir.input, src);
    const widths = width ? [width, width * 2] : ["auto" as const];
    const metadata = await Image(source, {
      ...imageOptions,
      widths,
      formats: ["auto"],
    });

    const htmlStyle = [
      width ? `width: ${width}px; height: auto;` : "",
      style ?? "",
    ]
      .join(" ")
      .trim();
    const htmlProps = {
      alt,
      style: htmlStyle,
      sizes: width
        ? `(min-resolution: 2x) ${width * 2}px, ${width}px`
        : undefined,
    };

    return Image.generateHTML(metadata, htmlProps);
  });

  return {
    dir: {
      input: "./src",
      output: `./${outputDir}`,
    },
  };
});
