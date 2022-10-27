# Projet Alyra #2

## Testing de smart contract

### Prérequis

- Docker
- Make

### Commandes

#### Lancer le projet
`docker compose up`

#### Lancer les tests
`make test`

#### Inspecter le coverage
`make coverage`

### Liste des tests

#### Modifiers
- onlyOwner : Deny

- onlyVoter : Deny

#### Transactions

- addVoter : Denies (mauvaise période, déjà enregistré) | Valid (event)

- addProposal : Denies (mauvaise période, proposition vide) | Valid (event)

- setVote: Denies (mauvaise période, déjà voté, proposition non trouvée) | Valid (event)

- tallyVotes : Deny (mauvaise période) | Valid (event)

- startProposalsRegistering : Deny (mauvaise période) | Valid (event)

- endProposalsRegistering : Deny (mauvaise période) | Valid (event)

- startVotingSession : Deny (mauvaise période) | Valid (event)

- endVotingSession : Deny (mauvaise période) | Valid (event)

#### Calls

- getVoter : Valid (valeur retournée)
- getOneProposal : Deny (Proposition qui n'existe pas) | Valid (valeur retournée)
- winningProposalID : Valid

### Equivalence hardhat -> Truffle

- expectRevert = expect().to.be.reverted ou expect().to.be.revertedWith()
- expectEvent = expect().to.be.emit ou expect().to.be.emit.withArgs()
