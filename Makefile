.PHONY: build
build:
	sam build

build-FrankleHighscoresFunction:
	npm install
	tsc
	cp -r dist/* $(ARTIFACTS_DIR)/

.PHONY: init
init: build
	sam deploy --parameter-overrides AwsCfToken="$(AWS_CF_TOKEN)"

.PHONY: deploy
deploy: build
	sam deploy

.PHONY: delete
delete:
	sam delete
