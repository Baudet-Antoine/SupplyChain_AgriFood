import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from "react-router-dom"
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json"
import { useTranslation } from "react-i18next";
import { IT, GB } from 'country-flag-icons/react/3x2'

function Show() {

    const [t, i18n] = useTranslation("translation");
    const handleChangeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    } 

    let listLot = {};
    let listActor = {};
    let listAction = {};
    let count = 0;

    listLot[count] = []
    listAction[count] = []
    listActor[count] = []
    

    const location = useLocation();
    const temporary = Number(location.state);
    const lotId = []
    lotId.push(temporary)
    
    const history = useNavigate()
    useEffect(() => {
        loadWeb3();
        loadBlockchaindata();
    }, [])

    const [loader, setloader] = useState(true);
    const [product, setProduct] = useState();
    const [absoluteLot, setAbsoluteLot] = useState();
    const [actors, setActors] = useState();
    const [actions, setActions] = useState();
    const [sources, setSources] = useState();
    const [sinks, setSinks] = useState();
    const [supLotStock, setSupLotStock] = useState();
    const [manLotStock, setManLotStock] = useState();
    const [disLotStock, setDisLotStock] = useState();
    const [retLotStock, setRetLotStock] = useState();
    const [hashProd, setHashProd] = useState();

    const loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            window.alert(
                t("ethAlert")
            );
        }
    };
    const loadBlockchaindata = async () => {
        setloader(true);
        const web3 = window.web3;
        const networkId = await web3.eth.net.getId();
        const networkData = SupplyChainABI.networks[networkId];
        if (networkData) {
            const supplychain = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
            const actCtr = await supplychain.methods.actorCtr().call();
            const act = {};
            for (let i = 0; i < actCtr; i++) {
                act[i] = await supplychain.methods.Actors(i + 1).call();
            }
            const prodCtr = await supplychain.methods.productCtr().call();
            const prod = {};
            const hashProd = {}
            for (let i = 0; i < prodCtr; i++) {
                prod[i] = await supplychain.methods.ProductStock(i + 1).call();
                hashProd[i] = await supplychain.methods.getProductHahs(i + 1).call();
            }
            const absoluteCtr = await supplychain.methods.absoluteCtr().call();
            const lot = {};
            for (let i = 0; i < absoluteCtr; i++) {
                lot[i] = await supplychain.methods.LotStock(i + 1).call();
            }
            const actionCtr = await supplychain.methods.actionCtr().call();
            const action = {};
            const sources = {};
            const sinks = {};
            for (let i = 0; i < actionCtr; i++) {
                action[i] = await supplychain.methods.Actions(i + 1).call();
                sources[i] = await supplychain.methods.getSourceAction(i+1).call();
                sinks[i] = await supplychain.methods.getSinkAction(i+1).call();
            }
            const supLotCtr = await supplychain.methods.supLotCtr().call();
            const supLot = {};
            for (let i = 0; i < supLotCtr; i++) {
                supLot[i] = await supplychain.methods.SupLotStock(i + 1).call();
            }
            const manLotCtr = await supplychain.methods.manLotCtr().call(); 
            const manLot = {};
            for (let i = 0; i < manLotCtr; i++) {
                manLot[i] = await supplychain.methods.ManLotStock(i + 1).call();
            }
            const disLotCtr = await supplychain.methods.disLotCtr().call();
            const disLot = {};
            for (let i = 0; i < disLotCtr; i++) {
                disLot[i] = await supplychain.methods.DisLotStock(i + 1).call();
            }
            const retLotCtr = await supplychain.methods.retLotCtr().call();
            const retLot = {};
            for (let i = 0; i < retLotCtr; i++) {
                retLot[i] = await supplychain.methods.RetLotStock(i + 1).call();
            }
            setProduct(prod);
            setActors(act);
            setAbsoluteLot(lot);
            setActions(action);
            setSources(sources);
            setSinks(sinks);
            setHashProd(hashProd);
            setSupLotStock(supLot);
            setManLotStock(manLot);
            setDisLotStock(disLot);
            setRetLotStock(retLot);
            setloader(false);
        }
        else {
            t("contractAlert")
        }
    }
    if (loader) {
        return (
            <div>
                <h1 className="wait">{t("loading")}</h1> 
            </div>
        )
    }

    const redirect_to_ClientHome = () => {
        history('/client');
    }
    
    const setArr = (stage, lotId) => {
        let tempSources = [];

        if(lotId.length === 1){
            let item = lotId[0]
            switch (stage) {
                case 0: //supply
                    listLot[count].push(parseInt(supLotStock[parseInt(item)-1].absolute_id))
                    for(let i=0; i<Object.keys(actors).length; i++){
                        if(actors[i].addr === supLotStock[parseInt(lotId)-1].actor){
                            listActor[count].push(parseInt(actors[i].id))
                            break;
                        }
                    }
                    for(let i=0; i<Object.keys(actions).length; i++){
                        if(parseInt(actions[i].actionType) === 7 && sinks[i].includes(supLotStock[parseInt(item)-1].id)){
                            for(let j=0; j<sources[i].length; j++){
                                tempSources.push(sources[i][j]);
                            }
                            listAction[count].push(parseInt(actions[i].id))
                            break;
                        }
                    }
                    setArr(1,[])
                    break;
                case 1: //manufacture
                    let tempStage = 0;
                    listLot[count].push(parseInt(manLotStock[parseInt(item)-1].absolute_id))
                    for(let i=0; i<Object.keys(actors).length; i++){
                        if(actors[i].addr === manLotStock[parseInt(lotId)-1].actor){
                            listActor[count].push(parseInt(actors[i].id))
                            break;
                        }
                    }
                    for(let i=0; i<Object.keys(actions).length; i++){
                        if(parseInt(actions[i].actionType) === 0 && sinks[i].includes(manLotStock[parseInt(item)-1].id)){
                            for(let j=0; j<Object.keys(supLotStock).length; j++){
                                if(parseInt(manLotStock[parseInt(item)-1].absolute_id) === parseInt(supLotStock[j].absolute_id)) {
                                    tempSources.push(supLotStock[j].id);
                                    tempStage = 0;
                                }
                            }
                            listAction[count].push(parseInt(actions[i].id))
                            break;
                        }
                        if(parseInt(actions[i].actionType) === 3 && sinks[i].includes(manLotStock[parseInt(item)-1].id)){ 
                            for(let j=0; j<sources[i].length; j++){
                                tempSources.push(sources[i][j]);
                                tempStage = 1;
                            }
                            listAction[count].push(parseInt(actions[i].id))
                            break;
                        }
                        if(parseInt(actions[i].actionType) === 5 && sinks[i].includes(manLotStock[parseInt(item)-1].id)){ 
                            for(let j=0; j<sources[i].length; j++){
                                tempSources.push(sources[i][j]);
                                tempStage = 1;
                            }
                            listAction[count].push(parseInt(actions[i].id))
                            break;
                        }
                        if(parseInt(actions[i].actionType) === 6 && sinks[i].includes(manLotStock[parseInt(item)-1].id)){
                            for(let j=0; j<sources[i].length; j++){
                                tempSources.push(sources[i][j]);
                                tempStage = 1;
                            }
                            listAction[count].push(parseInt(actions[i].id))
                            break; 
                        }
                    }
                    setArr(tempStage,tempSources)
                    break;
    
                case 2: //distribute
                    listLot[count].push(parseInt(disLotStock[parseInt(item)-1].absolute_id))
                    for(let i=0; i<Object.keys(actors).length; i++){
                        if(actors[i].addr === disLotStock[parseInt(lotId)-1].actor){
                            listActor[count].push(parseInt(actors[i].id))
                            break;
                        }
                    }
                    for(let i=0; i<Object.keys(actions).length; i++){
                        if(parseInt(actions[i].actionType) === 1 && sinks[i].includes(disLotStock[parseInt(item)-1].id)){
                            for(let j=0; j<sources[i].length; j++){
                                tempSources.push(sources[i][j]);
                            }
                            listAction[count].push(parseInt(actions[i].id))
                            break;
                        }
                    }
                    setArr(1,tempSources)
                    break;
    
                case 3: //retil
                    listLot[count].push(parseInt(retLotStock[parseInt(item)-1].absolute_id))
                    for(let i=0; i<Object.keys(actors).length; i++){
                        if(actors[i].addr === retLotStock[parseInt(lotId)-1].actor){
                            listActor[count].push(parseInt(actors[i].id))
                            break;
                        }
                    }
                    for(let i=0; i<Object.keys(actions).length; i++){
                        if(parseInt(actions[i].actionType) === 2 && sinks[i].includes(retLotStock[parseInt(item)-1].id)){
                            for(let j=0; j<sources[i].length; j++){
                                tempSources.push(sources[i][j]);
                            }
                            listAction[count].push(parseInt(actions[i].id))
                            break;
                        }
                    }
                    setArr(2,tempSources)
                    break;
            }
        }
        if(lotId.length > 1){
            for(let i=0; i<lotId.length; i++){
                count = count+1
                listLot[count] = []
                listAction[count] = []
                listActor[count] = []
                setArr(1, [lotId[i]])
            }
        }
                  
    }

    const getAction = (stage, lotId)  => {
        setArr(stage, lotId)
        return(
            <div className="container">
                {Object.keys(listLot).map(function(key){
                    return(
                        <div className="row mb-5">
                            <div className="col-md-12">
                                <div id="content">
                                    <ul className="timeline">
                                        {Object.keys(listLot[key]).map(function (k){
                                            return(
                                                <div>
                                                     <li className="event" data-date={getDate(parseInt(actions[listAction[key][k]-1].timestamp))}>
                                                        <h2>{product[parseInt(absoluteLot[listLot[key][k]-1].id_product)-1].name}</h2>
                                                        <p>
                                                            {actors[listActor[key][k]-1].name}, <a href={'https://gateway.pinata.cloud/ipfs/'+ actors[listActor[key][k]-1].hashFileActor} target='_blank' rel="noreferrer">{t("read")}</a> <br/>
                                                            {actors[listActor[key][k]-1].place} <br/>
                                                            {t("userActionText")} {showActionType(actions[listAction[key][k]-1].actionType, t)} <br/>
                                                            {Object.values(hashProd[parseInt(product[parseInt(absoluteLot[listLot[key][k]-1].id_product)-1].id)-1]).map(function (keys) {
                                                                return(
                                                                    <div>
                                                                        {t("userProductInfo")} <a href={'https://gateway.pinata.cloud/ipfs/'+ keys} target='_blank' rel="noreferrer">{t("read")}</a>
                                                                    </div>
                                                                )
                                                            })}
                                                        </p> <br/>
                                                    </li>
                                                </div>
                                            )
                                        })}
                                       
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }
    
    // Find the retail lot by absolute_id
    let foundRetLot = null;
    if (retLotStock) {
        for (const key of Object.keys(retLotStock)) {
            const lot = retLotStock[key];
            if (parseInt(lot.absolute_id) === temporary) {
                foundRetLot = lot;
                break;
            }
        }
    }
    if (!foundRetLot) {
        // LOG: Not found, print all available absolute_ids
        const available = retLotStock ? Object.values(retLotStock).map(l => l.absolute_id).join(', ') : 'none';
        return (
            <div className='main mb-5'>
                <dev className='container'>
                    <button onClick={redirect_to_ClientHome} className="ms-4 btn btn-danger" style={{ position: 'absolute', left: '35px', top: '40px' }}>HOME</button>
                    <h1 className='title'>Supply Chain</h1>
                    <GB title="English" type='button' onClick={() => handleChangeLanguage("en")}  style={{position: 'absolute', right: '55px', top: '45px', height: '30px'}}/>
                    <IT title="Italiano" type='button' onClick={() => handleChangeLanguage("it")}  style={{position: 'absolute', right: '120px', top: '45px', height: '30px'}}/>
                </dev>
                <br /><br/>
                <h2 style={{color: 'red'}}>Error: No retail lot found for absolute_id = {temporary}</h2>
                <p>Available retail lots: {available}</p>
            </div>
        )
    }
    // Defensive: check product exists
    const productIdx = parseInt(foundRetLot.id_product) - 1;
    const productObj = product ? product[productIdx] : null;
    if (!productObj) {
        return (
            <div className='main mb-5'>
                <h2 style={{color: 'red'}}>Error: No product found for id_product = {foundRetLot.id_product}</h2>
            </div>
        )
    }

    return(
        <div className='main mb-5'>
            <dev className='container'>
                <button onClick={redirect_to_ClientHome} className="ms-4 btn btn-danger" style={{ position: 'absolute', left: '35px', top: '40px' }}>HOME</button>
                <h1 className='title'>Supply Chain</h1>
                <GB title="English" type='button' onClick={() => handleChangeLanguage("en")}  style={{position: 'absolute', right: '55px', top: '45px', height: '30px'}}/>
                <IT title="Italiano" type='button' onClick={() => handleChangeLanguage("it")}  style={{position: 'absolute', right: '120px', top: '45px', height: '30px'}}/>
            </dev>
            <br /><br/>
            <h1>{t("lotToTrack")} {productObj.name}</h1>
            <div className="h4 pb-4 mb-4 border-bottom border-dark"></div>
            <br/>
            {getAction(3, [parseInt(foundRetLot.id)])}
        </div>
    )
    
}

function showActionType(action, t){
    switch(parseInt(action)) {
        case 0:
            return t("manufacture");
        case 1:
            return t("distribute");
        case 2:
            return t("retail");
        case 3:
            return t("transformation");
        case 4:
            return "Ateration";
        case 5:
            return t("integration");
        case 6:
            return t("division");
        case 7:
            return t("creation");
    }
}


function getDate(timestamp){
    var date = new Date(timestamp * 1000);
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var formattedDate = day + '/' + month + '/' + year;
    return formattedDate;
}

export default Show
