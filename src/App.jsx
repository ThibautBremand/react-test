import React, { Component } from 'react';
import _ from 'lodash'
import './App.css';
import Pokemon from './Pokemon';
import Loader from "./Loader";
import ReactFooter from "./ReactFooter";
import bluePokeball from './img/blue_pokeball.png'

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: '',
            isFetching: false,
            pokemonFound: false,

            name: '',
            id: '',
            types: [],
            sprite: '',
            detailedStats: {
                hp: '',
                atk: '',
                def: '',
                spAtk: '',
                spDef: '',
                spd: ''
            },
            detailedEvolutionChain: [],
            detailedMoves: [],
            movesTutors: []
        };

        this.newPokemon = this.newPokemon.bind(this);

        /* GENERAL CONSTS */
        this.BASE_URL = 'https://pokeapi.co/api/v2/pokemon/';

        /* Keys used to parse detailed stats */
        this.HP_KEY = 'hp';
        this.ATK_KEY = 'attack';
        this.DEF_KEY = 'defense';
        this.SPATK_KEY = 'special-attack';
        this.SPDEF_KEY = 'special-defense';
        this.SPD_KEY = 'speed';
    }

    /***
     * Search function from user input, calls the API and fills the state with the fetched data
     * */
    search() {
        let FETCH_URL = `${this.BASE_URL}${this.state.query.toLowerCase()}`;
        this.setState({
            isFetching:false,
            pokemonFound:false
        });
        this.fetchAPI(FETCH_URL);
    }

    /***
     * Fetch API function, calls the API using the given parameter
     */
    fetchAPI(FETCH_URL) {
        /* Used to store the detailed stats into the state */
        let detailedStats = this.state.detailedStats;

        /* Used to store the detailed moves into the state */
        let detailedMoves = this.state.detailedMoves;

        /* Used to store the detailed evolution chain into the state */
        let detailedEvolutionChain = this.state.detailedEvolutionChain;

        this.setState({
            name : '',
            id : '',
            sprite : '',
            types : [],
            detailedStats : {
                hp : '',
                atk : '',
                def : '',
                spAtk : '',
                spDef : '',
                spd : ''
            },
            detailedEvolutionChain : [],
            detailedMoves : [],
            movesTutors : []
        });

        /* Queries the API with the user's input */
        fetch(FETCH_URL, {
            method: 'GET'
        })
            .then(response => response.json())
            .then(json => {
                const pkmnList = json;
                this.setState({
                    pkmnList
                });

                /* Checks if the query entered by the user retrieves Pokemon results or not */
                if ("species" in json) {
                    /* Result found by the API, we can query the species and evolution chain */
                    this.setState({
                        isFetching:true,
                        pokemonFound : true
                    })
                    fetch(this.state.pkmnList.species.url, {
                        method: 'GET'
                    })
                        .then(response => response.json())
                        .then(json => {
                            const species = json;
                            this.setState({
                                species
                            });

                            fetch(this.state.species.evolution_chain.url, {
                                method: 'GET'
                            })

                                .then(response => response.json())
                                .then(json => {
                                    const evolutionChain = json;
                                    this.setState({
                                        evolutionChain,
                                        isFetching: false
                                    });

                                    /* Retrieves name */
                                    let name = `${pkmnList.forms[0].name} #${pkmnList.id}`;
                                    this.setState({
                                        name
                                    });
                                    this.setState({
                                        id : pkmnList.id
                                    });

                                    /* Retrieves sprite */
                                    this.setState({
                                        sprite: pkmnList.sprites['front_default']
                                    });

                                    /* Retrieves types */
                                    pkmnList.types.forEach((type) => {
                                        this.setState({
                                            types: this.state.types.concat([type.type.name])
                                        })
                                    });

                                    /* Retrieves stats */
                                    pkmnList.stats.forEach((stat) => {
                                        if (stat.stat.name === this.HP_KEY) {
                                            detailedStats.hp = stat.base_stat;
                                            this.setState({detailedStats});
                                        }

                                        if (stat.stat.name === this.ATK_KEY) {
                                            detailedStats.atk = stat.base_stat;
                                            this.setState({detailedStats});
                                        }

                                        if (stat.stat.name === this.DEF_KEY) {
                                            detailedStats.def = stat.base_stat;
                                            this.setState({detailedStats});
                                        }

                                        if (stat.stat.name === this.SPATK_KEY) {
                                            detailedStats.spAtk = stat.base_stat;
                                            this.setState({detailedStats});
                                        }

                                        if (stat.stat.name === this.SPDEF_KEY) {
                                            detailedStats.spDef = stat.base_stat;
                                            this.setState({detailedStats});
                                        }

                                        if (stat.stat.name === this.SPD_KEY) {
                                            detailedStats.spd = stat.base_stat;
                                            this.setState({detailedStats});
                                        }
                                    });

                                    /* Retrieves evolution chain */
                                    let currentEvolution = evolutionChain.chain.evolves_to;

                                    detailedEvolutionChain = {
                                        name: evolutionChain.chain.species.name,
                                        id: evolutionChain.chain.species.url.substr(
                                            evolutionChain.chain.species.url.indexOf('/pokemon-species/') + ('/pokemon-species/').length
                                        ).slice(0, -1)
                                    };
                                    this.setState({
                                        detailedEvolutionChain: this.state.detailedEvolutionChain.concat(detailedEvolutionChain)
                                    });

                                    if (currentEvolution[0] !== null && currentEvolution.length > 0) {
                                        detailedEvolutionChain = {
                                            name: currentEvolution[0].species.name,
                                            id: currentEvolution[0].species.url.substr(
                                                currentEvolution[0].species.url.indexOf('/pokemon-species/') + ('/pokemon-species/').length
                                            ).slice(0, -1)
                                        };
                                        this.setState({
                                            detailedEvolutionChain: this.state.detailedEvolutionChain.concat(detailedEvolutionChain)
                                        });

                                        if (currentEvolution[0].evolves_to[0] !== null && currentEvolution[0].evolves_to.length > 0) {
                                            detailedEvolutionChain = {
                                                name: currentEvolution[0].evolves_to[0].species.name,
                                                id: currentEvolution[0].evolves_to[0].species.url.substr(
                                                    currentEvolution[0].evolves_to[0].species.url.indexOf('/pokemon-species/') + ('/pokemon-species/').length
                                                ).slice(0, -1)
                                            };
                                            this.setState({
                                                detailedEvolutionChain: this.state.detailedEvolutionChain.concat(detailedEvolutionChain)
                                            });
                                        }
                                    }

                                    /* Retrieves moves */
                                    pkmnList.moves.forEach((move) => {
                                        move.version_group_details.forEach((move_version) => {
                                            if (move_version.version_group.name === 'sun-moon') {
                                                /* Gen 7 move, we can display it */
                                                if (move_version.move_learn_method.name === 'level-up') {
                                                    detailedMoves = {
                                                        level : move_version.level_learned_at,
                                                        name : move.move.name
                                                    };
                                                    this.setState({
                                                        detailedMoves: this.state.detailedMoves.concat(detailedMoves)
                                                    })
                                                }
                                            }
                                        })
                                    });

                                    /* Order moves by ascending */
                                    let sortedDetailedMoves = _.sortBy(this.state.detailedMoves, 'level', function(n) {
                                        return Math.sin(n);
                                    });
                                    this.setState({
                                        detailedMoves:sortedDetailedMoves
                                    });

                                    /* Retrieves moves tutors */
                                    let moveTutor;
                                    let movesTutorsLoop = [];
                                    pkmnList.moves.forEach((move) => {
                                        move.version_group_details.forEach((move_version) => {
                                            /* Move tutor, we can display it */
                                            if (move_version.move_learn_method.name === 'tutor') {
                                                moveTutor = {
                                                    gen : move_version.version_group.name,
                                                    name : move.move.name
                                                };
                                                movesTutorsLoop = movesTutorsLoop.concat(moveTutor)
                                            }
                                        })
                                    });

                                    /* Order moves by ascending */
                                    movesTutorsLoop = _.sortBy(movesTutorsLoop, 'gen', function(n) {
                                        return Math.sin(n);
                                    });

                                    let movesTutorsByGen = [];
                                    let indGen = 0;
                                    for (let i = 0; i < movesTutorsLoop.length; ++i) {
                                        if (i === 0) {
                                            movesTutorsByGen[indGen] = [];
                                            movesTutorsByGen[indGen] = movesTutorsByGen[indGen].concat(movesTutorsLoop[i]);
                                        }
                                        if (i > 0) {
                                            if (movesTutorsByGen[indGen][0].gen === movesTutorsLoop[i].gen) {
                                                movesTutorsByGen[indGen] = movesTutorsByGen[indGen].concat(movesTutorsLoop[i]);
                                            }
                                            else {
                                                indGen ++;
                                                movesTutorsByGen[indGen] = [];
                                                movesTutorsByGen[indGen] = movesTutorsByGen[indGen].concat(movesTutorsLoop[i]);
                                            }
                                        }
                                    }
                                    this.setState({movesTutors: movesTutorsByGen});
                                });
                        });
                }
                else {
                    /* The user entered a wrong query */
                    this.setState({
                        pokemonFound : false
                    })
                }
            });
    }

    /**
     * Refreshes the displayed Pokemon, for example when the user clicks on the Next button
     */
    newPokemon(query) {
        let FETCH_URL = `${this.BASE_URL}${query}`;
        this.setState({
            isFetching:false,
            pokemonFound:false
        });
        this.fetchAPI(FETCH_URL);
    }

    render() {
        return (
            <div className="App">
                <h1 className="App-title">Pokedex Master</h1>
                <h4 className="App-title">Gotta find 'em all !</h4>

                <div className="container-fluid">
                    <div className="form-group">
                        <div className="input-group">
                            <input className="form-control col-md-5 offset-md-3"
                                type="text"
                                placeholder="Search for a Pokemon name or number"
                                value={this.state.query}
                                onChange={event => {this.setState({
                                    query: event.target.value
                                })}}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        this.search()
                                    }
                                }}
                            />
                            <div className="input-group-append">
                                <button className="btn btn-secondary" type="button" onClick={() => this.search()}><i className="fa fa-search" aria-hidden="true"></i></button>
                            </div>
                        </div>
                    </div>

                    {
                        this.state.pokemonFound === true
                            ?
                            this.state.evolutionChain !== null
                                ?
                                <Pokemon
                                    newPokemon = {this.newPokemon}

                                    name = {this.state.name}
                                    id = {this.state.id}
                                    types = {this.state.types}
                                    sprite = {this.state.sprite}
                                    detailedStats = {this.state.detailedStats}
                                    detailedEvolutionChain = {this.state.detailedEvolutionChain}
                                    detailedMoves = {this.state.detailedMoves}
                                    movesTutors = {this.state.movesTutors}
                                />
                                : <div></div>
                            : <div></div>
                    }

                    {
                        this.state.isFetching !== false
                            ?
                            <Loader
                            />
                            : <div></div>
                    }
                    <img className="bluePokeball" src={bluePokeball} alt=""/>

                    <ReactFooter
                    />
                </div>
            </div>
        )
    }
}

export default App;
