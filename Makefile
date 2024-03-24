.PHONY: build
build:
	sam build

build-FrankleHighscoresFunction:
	npm install
	tsc
	cp -r dist/* $(ARTIFACTS_DIR)/

.PHONY: init
init: build
	sam deploy --guided

.PHONY: deploy
deploy: build
	sam deploy

.PHONY: delete
delete:
	sam delete
