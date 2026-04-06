export default {
    sourceDir: ".",
    ignoreFiles: [
        "node_modules/**",
        "scripts/**",
        "zip/**",
        "tests/**",
        "package.json",
        "package-lock.json",
        "web-ext-config.mjs",
    ],
    run: {
        firefox: "/usr/bin/thunderbird",
    },
}
