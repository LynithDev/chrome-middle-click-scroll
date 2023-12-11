import esbuild from "esbuild";
import htmlPlugin from '@chialab/esbuild-plugin-html';
import chokidar from "chokidar";
import fs from "fs/promises";

const DEV = process.env.NODE_ENV === 'development';

const ctx = await esbuild.context({
    entryPoints: [
        "src/index.html",
        "src/injected/index.ts",
        "src/manifest.json",
    ],
    loader: {
        ".json": "copy",
    },
    bundle: true,
    minify: true,
    outdir: "dist/",
    chunkNames: '[ext]/[name]',
    metafile: true,
    plugins: [
        htmlPlugin({
            files: [
                {
                    entryPoints: ["src/index.jsx"],
                    filename: "index.html",
                }
            ]
        }),
    ],
});

if (DEV) {
    console.log("\u001b[44m\u001b[1;30m WATCHING MODE \u001b[0m\n")
    
    const watcher = chokidar.watch("src/**/*.{ts,tsx,js,jsx,html,css}", {
        persistent: true,
    });

    async function rebuild() {
        try {
            await ctx.rebuild();
            await fs.cp("images", "dist/images", { recursive: true });
        } catch (e) {
            
        }
    }

    watcher.on("change", async (e) => {
        console.log("\u001b[45m\u001b[1;30m CHANGED \u001b[0m " + e)
        await rebuild();
    });

    watcher.once("ready", async () => {
        console.log("\u001b[44m\u001b[1;30m READY \u001b[0m")
        await rebuild();
    });

} else {
    await ctx.rebuild();
    await ctx.dispose();
}