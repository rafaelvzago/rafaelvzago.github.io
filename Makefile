.PHONY: setup serve build test spec-init spec-version

setup:
	sudo dnf install -y gcc-c++ make patch perl-core zlib zlib-devel readline readline-devel \
		libffi-devel openssl-devel bzip2 autoconf automake libtool bison curl \
		sqlite-devel libyaml-devel
	mise use ruby@3.4.2
	mise use ruby
	gem install bundler
	bundle update

serve:
	bundle exec jekyll serve

build:
	bundle exec jekyll build

test: build
	bundle exec htmlproofer ./_site

spec-init:
	uvx --from git+https://github.com/github/spec-kit.git specify init . --ai claude --script sh

spec-version:
	uvx --from git+https://github.com/github/spec-kit.git specify version
