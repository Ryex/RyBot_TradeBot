
test:
ifdef CI
	istanbul cover ./node_modules/vows/bin/vows --report lcovonly -- tests/*_test.js --spec && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage
else
	vows tests/*_test.js --spec
endif