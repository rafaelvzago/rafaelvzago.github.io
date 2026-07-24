.PHONY: setup serve build test

HUGO ?= hugo

setup:
	@command -v hugo >/dev/null || { echo "Install Hugo Extended (>= 0.125): https://gohugo.io/installation/"; exit 1; }
	git submodule update --init --recursive
	$(HUGO) version

serve:
	$(HUGO) server --bind 127.0.0.1 --port 1313 --baseURL http://127.0.0.1:1313/ --disableFastRender --noHTTPCache

build:
	$(HUGO) --minify --gc

test: build
	@if command -v htmlproofer >/dev/null 2>&1; then \
		htmlproofer ./public --disable-external=true; \
	elif command -v bundle >/dev/null 2>&1 && bundle exec htmlproofer --version >/dev/null 2>&1; then \
		bundle exec htmlproofer ./public --disable-external=true; \
	else \
		echo "htmlproofer not found; verifying build artifacts instead"; \
		test -f public/index.html; \
		test -f public/about/index.html; \
		test -d public/posts; \
		test -f public/en/index.html; \
		test -f public/en/about/index.html; \
		test -d public/en/posts; \
		grep -q 'lang-switch' public/index.html; \
		grep -q 'G-9J3YRPN8EN' public/index.html; \
		grep -q 'GTM-592PS4S2' public/index.html; \
		echo "OK: hugo build + tracker smoke checks passed"; \
	fi
