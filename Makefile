REPORTER = spec
MYSQL_USER=doorserver
MYSQL_PASSWORD=doorserver
MYSQL_DATABADSE=doorserver_test

###
# Testing
###
UNIT_TESTS = $(shell find test -name '*.test.js')
BIN = node_modules/.bin
SRC_FILES = $(shell find lib -type f \( -name "*.js" ! \
	-path "*node_modules*" \))
JSHINT_CONFIG = .jshintrc

# to run a single test:
# make test UNIT_TESTS=test/..
test-unit: jshint setup-test-data
	@./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		-t 8000 \
		--globals encoding \
		--bail \
		$(UNIT_TESTS)

test-all:	test
test: test-unit

# PHONIES
.PHONY: test test-all test-unit

###
# Linting
###
jshint:
	@$(BIN)/jshint --config $(JSHINT_CONFIG) \
		$(SRC_FILES)

###
# Cleanup
###
clean:
	rm -rf build

clean-all: clean
	rm -rf node_modules


###
# Test data
###
setup-test-data:
	@mysql -u $(MYSQL_USER) --password=$(MYSQL_PASSWORD) $(MYSQL_DATABASE) < testdata.sql

.PHONY: setup-test-data
