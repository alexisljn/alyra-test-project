# Projet Alyra #2

## Warning

This project was a school project from Alyra, the french blockchain school.
I had to write unit tests for this voting contract but it's not a contract written by me.

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

#### Changement du Workflow status

- startProposalsRegistering : Deny (mauvaise période) | Valid (event)

- endProposalsRegistering : Deny (mauvaise période) | Valid (event)

- startVotingSession : Deny (mauvaise période) | Valid (event)

- endVotingSession : Deny (mauvaise période) | Valid (event)

#### Gestion des électeurs

- addVoter : Denies (mauvaise période, déjà enregistré) | Valid (event)

- getVoter : Valid (valeur retournée)

#### Gestion des propositions

- addProposal : Denies (mauvaise période, proposition vide) | Valid (event)

- getOneProposal : Deny (Proposition qui n'existe pas) | Valid (valeur retournée)

#### Gestion des votes

- setVote: Denies (mauvaise période, déjà voté, proposition non trouvée) | Valid (event)

#### Gestion des résultats

- tallyVotes : Deny (mauvaise période) | Valid (event)

- winningProposalID : Valid

### Equivalence hardhat -> Truffle

- expectRevert = expect().to.be.reverted ou expect().to.be.revertedWith()
- expectEvent = expect().to.be.emit ou expect().to.be.emit.withArgs()
