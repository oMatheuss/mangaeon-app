# Mangá Éon

This is the port for desktop for the [mangaeon](https://mangaeon.com) page. Which can be found on this [repository](https://github.com/oMatheuss/mangaeon).

As the site, it uses the [mangadex](https://mangadex.org/) api. A big thanks to them for creating such a great manga api.

## Developing

The project uses static [Next.JS](https://nextjs.org/) for the frontend and [Tauri](https://tauri.app/) for the backend and for multi-platform deployment.

First, you need [Rust](https://www.rust-lang.org/) and [Node](https://nodejs.org).

Then, you will need the `tauri-cli` which can be installed with cargo:

```console
cargo install tauri-cli
```

After, you can install the dependencies and run the project using:

```console
npm install && cargo tauri dev
```

## Contributing

If you find any issues or something that could be improved, feel free to open an issue or make a PR at any time.

Here are some TODOS I want to have implemented:

### TODOs:

- refactor some uglie parts;
- make the app have an language option;
- add the offline feature;
- custom themes;
- custom search filters;
- loading indicators;
