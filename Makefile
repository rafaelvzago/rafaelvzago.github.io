.PHONY: setup serve

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
