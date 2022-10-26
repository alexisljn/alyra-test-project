.PHONY: setup run bash compile test console deploy

NETWORK="localhost"

setup:
	docker compose run hardhat npm install -D --verbose @nomicfoundation/hardhat-toolbox

bash:
	docker compose exec hardhat bash

compile:
	docker compose exec hardhat npx hardhat compile

test:
ifdef FILES
	docker compose exec hardhat npx hardhat test $(FILES) --network $(NETWORK)
else
	docker compose exec hardhat npx hardhat test --network $(NETWORK)
endif

run:
ifdef SCRIPT
	docker compose exec hardhat npx hardhat run $(SCRIPT) --network $(NETWORK)
else
	docker compose exec hardhat npx hardhat run ./scripts/deploy.ts --network $(NETWORK)
endif

console:
	docker compose exec hardhat npx hardhat console --network $(NETWORK)
