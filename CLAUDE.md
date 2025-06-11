# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Rafael Zago's personal blog built with Jekyll using the Chirpy theme. The site is written in Portuguese (pt-BR) and focuses on cloud, DevOps, infrastructure, automation, and AI-related topics. The site is deployed to GitHub Pages.

## Development Commands

### Basic Jekyll Operations
- `bundle install` - Install dependencies
- `bundle exec jekyll serve` - Run development server (usually at http://localhost:4000)
- `bundle exec jekyll serve --drafts` - Run development server including draft posts
- `bundle exec jekyll build` - Build the site for production
- `bundle exec jekyll clean` - Clean the build directory

### Testing
- `bundle exec htmlproofer ./_site` - Run HTML validation tests after building

## Content Structure

### Posts
- All blog posts are in `_posts/` with filename format `YYYY-MM-DD-title.md`
- Posts must include frontmatter with `layout: post`, `title`, `date`, `categories`, and `tags`
- Posts are written in Portuguese
- Post URLs follow the pattern `/posts/:title/`

### Static Pages
- Tab pages (About, Archives, Categories, Tags) are in `_tabs/`
- Each tab has a `layout: page` and permalink structure

### Assets
- Images are stored in `assets/` and `assets/img/`
- Header images for posts are in `assets/img/headers/`
- Favicons are in `assets/img/favicons/`

### QR Code System
- QR code generation system in `qr/` directory
- `gerar_qrcodes.py` generates QR codes from URLs listed in `urls.txt`
- QR codes redirect to the site with ID parameters for tracking

## Key Configuration

- **Theme**: jekyll-theme-chirpy
- **Language**: Portuguese (pt-BR)
- **Timezone**: America/Sao_Paulo
- **Base URL**: https://rafaelvzago.github.io
- **Google Analytics**: G-9J3YRPN8EN

## Git Workflow

- **Main branch**: `main` (for production/GitHub Pages)
- **Development branch**: `development` (for active development)
- Posts are automatically tagged with last modification dates via the `_plugins/posts-lastmod-hook.rb` plugin

## Content Guidelines

- Posts should focus on cloud, DevOps, infrastructure, automation, Linux, containers, Kubernetes, AI/ML topics
- All content is in Portuguese
- Use appropriate header images from `assets/img/headers/`
- Include relevant categories and tags in post frontmatter
- TOC is enabled by default for posts

## Code Style

- **Indentation**: Use 4 spaces for indentation (no tabs)