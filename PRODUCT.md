# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite + TypeScript; MDX-based article content; static site generation with metadata and SEO scripts; GitHub Pages deployment.

## Users

Primary users are readers researching Islamic history, theology, Quranic references, hadith, and related evidentiary topics in Bosnian/Serbo-Croatian. The audience includes curious general readers, students, and believers looking for structured reference material.

## Product Purpose

This project exists to make complex religious and historical topics easier to explore and compare through curated articles, categories, and search. Success means a reader can find a subject quickly, read with confidence, and navigate the archive without friction.

## Positioning

ADAM functions as a research archive and reference database rather than a general blog, news outlet, or community platform. Its differentiator is the structured gathering of article-based analysis and source-focused material around Islamic and related subjects.

## Operating Context

Users browse on desktop and mobile browsers, read long-form articles, move between categories and tags, and use search to find relevant topics. The site is structured as a reference-driven archive with informational and legal pages alongside the main article library.

## Capabilities and Constraints

- Topic-based architecture across categories such as hadith, atheism, Christianity, Hinduism, Islam, history, and related subjects.
- Long-form MDX article content with metadata, search, tags, and related navigation.
- Published archive structure with route-based category and article pages.
- SEO and OG-image generation scripts for structured publishing.
- Public static deployment under the GitHub Pages basename /ADAM-Wiki.
- No user accounts, commenting, commerce, or forum workflows are part of the current product scope.

## Brand Commitments

The product name is ADAM — Research Database. The current implementation presents a serious, editorial, research-oriented identity with formal typography and a content-first experience. No additional binding brand system was provided beyond the existing site naming and editorial tone.

## Evidence on Hand

- `package.json` defines the Vite/React project and static build pipeline.
- `metadata.json` describes the project as a research landing page for Islamic source material and authentication.
- `src/App.tsx` reveals the site structure, route set, and category/article architecture.
- `src/content/articles/**` contains the article sources and the actual knowledge base.
- `public/` contains legal, SEO, and asset files used across the site.
- `scripts/` includes generation and prerender tooling that support metadata, sitemap, and OG-image publishing.

## Product Principles

1. Make difficult topics navigable through strong structure and search.
2. Preserve trust by favoring research, references, and clarity over sensationalism.
3. Keep the reading experience durable and legible across devices.
4. Treat the archive as a knowledge resource, not a social or promotional surface.

## Accessibility & Inclusion

The site should remain readable, navigable, and broadly usable for a diverse audience. The current product emphasizes long-form reading, clear hierarchy, and mobile-friendly access, with a general expectation of keyboard- and screen-reader-friendly content structure.
