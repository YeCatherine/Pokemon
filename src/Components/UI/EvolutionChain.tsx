import React, {useEffect, useState} from "react";
import IPokemonData from "../../Types/IPokemonData";
import {ListGroup} from "react-bootstrap";
import {getIdFromURL} from "../../Services/Common";
import PokemonListService from "../../Services/PokemonListService";
import PokemonCard from "./PokemonCard";

/**
 * Item of chain evolution sequence.
 */
interface IEvolutionChainItem {
    species: IPokemonData | null;
    evolves_to: Array<IEvolutionChainItem>;
}

interface IEvolutionComponent {
    pokemon: IPokemonData
    pokemonSpecies: IPokemonData
}

/**
 * Retrieves evolution chain.
 * @param props The pokemon.
 * @constructor The functional component of EvolutionChain.
 */
const EvolutionChain: React.FC<IEvolutionComponent> = (props) => {
    const {pokemonSpecies} = props;
    const [evolution, setEvolution] = useState<Array<IPokemonData>>([]);

    useEffect(() => {
        // Get evolution id.
        if (pokemonSpecies.evolution_chain?.url) {
            const evolutionId = getIdFromURL(pokemonSpecies.evolution_chain?.url);
            if (typeof evolutionId === 'undefined') return undefined;

            PokemonListService.getEvolutionChain(evolutionId)
                .then((response: any) => {
                    // Restructure chain.
                    if (typeof response.data.chain === "undefined") return;

                    const evolutionChain = response.data.chain;
                    const evolutionList: Array<IPokemonData> = [];
                    if (typeof evolutionChain === "undefined") return;

                    (function getItem(chainItem: IEvolutionChainItem): any {
                            if (chainItem.species) {
                                evolutionList.push(chainItem.species)
                                if (chainItem.evolves_to.length) {
                                    getItem(chainItem.evolves_to[0]);
                                }
                            }
                        }
                    )(evolutionChain);
                    setEvolution(evolutionList);

                })
                .catch((e: any) => {
                    console.log(e);
                });
        }
    }, []);

    /**
     * Get Evolution sequense.
     *
     * @param {Array} evolution - List of related pokemons evolution.
     */
    if (evolution.length <= 1) return null;
    return (
        <ul className="card text-dark text-center">
            <ListGroup>Evolution Chain</ListGroup>
            {evolution.map((currentPokemon, index) => {
                return (<PokemonCard
                    key={index}
                    pokemon={currentPokemon}/>);
            })}
        </ul>
    )
}
export default EvolutionChain;
