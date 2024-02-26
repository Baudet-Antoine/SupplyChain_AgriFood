import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from "react-router-dom"
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json"
import { useTranslation } from "react-i18next";
import { IT, GB } from 'country-flag-icons/react/3x2'

function Track() {

    const [t, i18n] = useTranslation("translation");
    const handleChangeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    } 

    const location = useLocation();
    const absoluteId = Number(location.state[0]);
    const temporary = Number(location.state[1]);
    const lotId = []
    lotId.push(temporary)
    let actorIndex;
    
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

    console.log(actions)
    console.log(sources)
    console.log(sinks)
    
    const getAction = (stage, lotId) => {
        
        let tempSources = [];
        let tempStage = [];
        let count=-1;
        if(lotId.length!=0){
            return(
                <div>
                    {lotId.map(function(item){
                        count++;
                        switch (stage[count]) {
                            case 0:
                                return(
                                    <div>
                                        {supPart(item)}  
                                    </div>
                                )
                            case 1:
                                for(let i=0; i<Object.keys(actions).length; i++){
                                    if(parseInt(actions[i].actionType) == 0 && sinks[i].includes(manLotStock[parseInt(item)-1].id)){
                                        for(let j=0; j<Object.keys(supLotStock).length; j++){
                                            if(parseInt(manLotStock[parseInt(item)-1].absolute_id) == parseInt(supLotStock[j].absolute_id)) {
                                                tempSources.push(supLotStock[j].id);
                                                tempStage.push(0);
                                            }
                                        }
                                        return(
                                            <div>
                                                {manPart(item, actions[i].id)}
                                            </div>
                                        )  
                                    }
                                    if(parseInt(actions[i].actionType) == 3 && sinks[i].includes(manLotStock[parseInt(item)-1].id)){ 
                                        for(let j=0; j<sources[i].length; j++){
                                            tempSources.push(sources[i][j]);
                                            tempStage.push(1);
                                        }
                                        return(
                                            <div>
                                                {manPart(item,actions[i].id)}
                                            </div>
                                        ) 
                                    }
                                    if(parseInt(actions[i].actionType) == 5 && sinks[i].includes(manLotStock[parseInt(item)-1].id)){ 
                                        for(let j=0; j<sources[i].length; j++){
                                            tempSources.push(sources[i][j]);
                                            tempStage.push(1);
                                        }
                                        return(
                                            <div>
                                                {manPart(item,actions[i].id)}
                                            </div>
                                        ) 
                                    }
                                    if(parseInt(actions[i].actionType) == 6 && sinks[i].includes(manLotStock[parseInt(item)-1].id)){
                                        for(let j=0; j<sources[i].length; j++){
                                            tempSources.push(sources[i][j]);
                                            tempStage.push(1);
                                        }
                                        return(
                                            <div>
                                                {manPart(item,actions[i].id)}
                                            </div>
                                        )  
                                    }
                                } 
                                break;
                            case 2:
                                for(let i=0; i<Object.keys(actions).length; i++){
                                    if(parseInt(actions[i].actionType) == 1 && sinks[i].includes(disLotStock[parseInt(item)-1].id)){
                                        for(let j=0; j<sources[i].length; j++){
                                            tempSources.push(sources[i][j]);
                                            tempStage.push(1);
                                        }
                                        return(
                                            <div>
                                                {disPart(item,actions[i].id)}
                                            </div>
                                        )  
                                    }
                                }
                                break;
                            case 3:
                                for(let i=0; i<Object.keys(actions).length; i++){
                                    if(parseInt(actions[i].actionType) == 2 && sinks[i].includes(retLotStock[parseInt(item)-1].id)){
                                        for(let j=0; j<sources[i].length; j++){
                                            tempSources.push(sources[i][j]);
                                            tempStage.push(2);
                                        }
                                        return(
                                            <div>
                                                {retPart(item,actions[i].id)}
                                            </div>
                                        )  
                                    }
                                }
                                break;
                            case 4:
                                tempStage.push(3);
                                tempSources.push(item)
                                return(
                                    <div>
                                        {soldPart(item)}  
                                    </div>
                                )
                        }
                    })}
                    {showArrow(tempStage)}
                    {getAction(tempStage, tempSources)}
                </div>
            )
        }
    }

    const redirect_to_list = () => {
        history('/performaction');
    }

    const supPart = (lotId) => {
        for(let i=0; i<Object.keys(actors).length; i++){
            if(actors[i].addr == supLotStock[parseInt(lotId)-1].actor){
                actorIndex = parseInt(actors[i].id)-1;
                break;
            }
        }
        let x=0;
        return(
            <div className='mb-4 row'>
                <div className='col-6'>
                    <p>
                        {t("responsible")} {t("sup")}: <b>{actors[actorIndex].name}</b><br/>
                        {t("locOf")} {t("sup")}: <b>{actors[actorIndex].place}</b><br/>
                        {t("infoOf")} {t("sup")}: <a href={'https://gateway.pinata.cloud/ipfs/'+ actors[actorIndex].hashFileActor} target='_blank' rel="noreferrer">{t("read")}</a>
                    </p>
                </div>
                <div className='col-6'>
                    <p>
                        {t("prodLot")}: <b>{product[parseInt(supLotStock[parseInt(lotId)-1].id_product)-1].name}</b><br/>
                        <b>{showStage(0, t)}</b> <br/>
                        {t("prod")}  <b>{product[parseInt(parseInt(supLotStock[parseInt(lotId)-1].id_product))-1].simple ? "Simple" : "Complex"}</b> <br/>
                        {t("currentWeight")} <b>{parseInt(supLotStock[parseInt(lotId)-1].size)} Kg</b><br/>
                        {t("locationLot")}: <b>{supLotStock[parseInt(lotId)-1].location}</b><br/>
                        {Object.values(hashProd[parseInt(product[parseInt(supLotStock[parseInt(lotId)-1].id_product)-1].id)-1]).map(function (keys) {
                            x++;
                            return(
                                <div>
                                    File {x}: <a href={'https://gateway.pinata.cloud/ipfs/'+ keys} target='_blank' rel="noreferrer">{t("read")}</a>
                                </div>
                            )
                        })}
                    </p>
                </div>
            </div>
        )
    }
    const manPart = (lotId, actionId) => {
        for(let i=0; i<Object.keys(actors).length; i++){
            if(actors[i].addr == manLotStock[parseInt(lotId)-1].actor){
                actorIndex = parseInt(actors[i].id)-1;
                break;
            }
        }
        let x=0;
        return(
            <div className='mb-4 row'>
                <div className='col-4'>
                    <p>
                        {t("responsible")} {t("man")}: <b>{actors[actorIndex].name}</b><br/>
                        {t("locOf")} {t("man")}: <b>{actors[actorIndex].place}</b><br/>
                        {t("infoOf")} {t("man")}: <a href={'https://gateway.pinata.cloud/ipfs/'+ actors[actorIndex].hashFileActor} target='_blank' rel="noreferrer">{t("read")}</a>
                    </p>
                </div>
                <div className='col-4'>
                    <p>
                        {t("actType")}: <b>{showActionType(actions[parseInt(actionId)-1].actionType, t)}</b><br/>
                        {t("duration")}: <b>{parseInt(actions[parseInt(actionId)-1].duration)} min</b><br/>
                        <p style={{display: actions[parseInt(actionId)-1].hashFileAction==""? "None" : "inline"}}>
                            {t("infoOf")} {t("actType")}: <a href={'https://gateway.pinata.cloud/ipfs/'+ actions[parseInt(actionId)-1].hashFileAction} target='_blank' rel="noreferrer">{t("read")}</a>
                        </p>

                    </p>
                </div>
                <div className='col-4'>
                    <p>
                        {t("prodLot")}: <b>{product[parseInt(manLotStock[parseInt(lotId)-1].id_product)-1].name}</b><br/>
                        <b>{showStage(1, t)}</b> <br/>
                        {t("prod")}  <b>{product[parseInt(parseInt(manLotStock[parseInt(lotId)-1].id_product))-1].simple ? "Simple" : "Complex"}</b> <br/>
                        {t("currentWeight")} <b>{parseInt(manLotStock[parseInt(lotId)-1].size)} Kg</b><br/>
                        {t("locationLot")}: <b>{manLotStock[parseInt(lotId)-1].location}</b><br/>
                        {Object.values(hashProd[parseInt(product[parseInt(manLotStock[parseInt(lotId)-1].id_product)-1].id)-1]).map(function (keys) {
                            x++;
                            return(
                                <div>
                                    File {x}: <a href={'https://gateway.pinata.cloud/ipfs/'+ keys} target='_blank' rel="noreferrer">{t("read")}</a>
                                </div>
                            )
                        })}
                    </p>
                </div>
            </div>
        )
    }
    const disPart = (lotId, actionId) => {
        for(let i=0; i<Object.keys(actors).length; i++){
            if(actors[i].addr == disLotStock[parseInt(lotId)-1].actor){
                actorIndex = parseInt(actors[i].id)-1;
                break;
            }
        }
        let x=0;
        return(
            <div className='mb-4 row'>
                <div className='col-4'>
                    <p>
                        {t("responsible")} {t("dis")}: <b>{actors[actorIndex].name}</b><br/>
                        {t("locOf")} {t("dis")}: <b>{actors[actorIndex].place}</b><br/>
                        {t("infoOf")} {t("dis")}: <a href={'https://gateway.pinata.cloud/ipfs/'+ actors[actorIndex].hashFileActor} target='_blank' rel="noreferrer">{t("read")}</a>
                    </p>
                </div>
                <div className='col-4'>
                    <p>
                        {t("actType")}: <b>{showActionType(actions[parseInt(actionId)-1].actionType, t)}</b><br/>
                        {t("duration")}: <b>{parseInt(actions[parseInt(actionId)-1].duration)} min</b><br/>
                        <p style={{display: actions[parseInt(actionId)-1].hashFileAction==""? "None" : "inline"}}>
                            {t("infoOf")} {t("actType")}: <a href={'https://gateway.pinata.cloud/ipfs/'+ actions[parseInt(actionId)-1].hashFileAction} target='_blank' rel="noreferrer">{t("read")}</a>
                        </p>
                    </p>
                </div>
                <div className='col-4'>
                    <p>
                        {t("prodLot")}: <b>{product[parseInt(disLotStock[parseInt(lotId)-1].id_product)-1].name}</b><br/>
                        <b>{showStage(2, t)}</b> <br/>
                        {t("prod")}  <b>{product[parseInt(parseInt(disLotStock[parseInt(lotId)-1].id_product))-1].simple ? "Simple" : "Complex"}</b> <br/>
                        {t("currentWeight")} <b>{parseInt(disLotStock[parseInt(lotId)-1].size)} Kg</b><br/>
                        {t("locationLot")}: <b>{disLotStock[parseInt(lotId)-1].location}</b><br/>
                        {Object.values(hashProd[parseInt(product[parseInt(disLotStock[parseInt(lotId)-1].id_product)-1].id)-1]).map(function (keys) {
                            x++;
                            return(
                                <div>
                                    File {x}: <a href={'https://gateway.pinata.cloud/ipfs/'+ keys} target='_blank' rel="noreferrer">{t("read")}</a>
                                </div>
                            )
                        })}
                    </p>
                </div>
            </div>
        )
    }
    const retPart = (lotId, actionId) => {
        for(let i=0; i<Object.keys(actors).length; i++){
            if(actors[i].addr == retLotStock[parseInt(lotId)-1].actor){
                actorIndex = parseInt(actors[i].id)-1;
                break;
            }
        }
        let x=0;
        return(
            <div className='mb-4 row'>
                <div className='col-4'>
                    <p>
                        {t("responsible")} {t("ret")}: <b>{actors[actorIndex].name}</b><br/>
                        {t("locOf")} {t("ret")}: <b>{actors[actorIndex].place}</b><br/>
                        {t("infoOf")} {t("ret")}: <a href={'https://gateway.pinata.cloud/ipfs/'+ actors[actorIndex].hashFileActor} target='_blank' rel="noreferrer">{t("read")}</a>
                    </p>
                </div>
                <div className='col-4'>
                    <p>
                        {t("actType")}: <b>{showActionType(actions[parseInt(actionId)-1].actionType, t)}</b><br/>
                        {t("duration")}: <b>{parseInt(actions[parseInt(actionId)-1].duration)} min</b><br/>
                        <p style={{display: actions[parseInt(actionId)-1].hashFileAction==""? "None" : "inline"}}>
                            {t("infoOf")} {t("actType")}: <a href={'https://gateway.pinata.cloud/ipfs/'+ actions[parseInt(actionId)-1].hashFileAction} target='_blank' rel="noreferrer">{t("read")}</a>
                        </p>
                    </p>
                </div>
                <div className='col-4'>
                    <p>
                        {t("prodLot")}: <b>{product[parseInt(retLotStock[parseInt(lotId)-1].id_product)-1].name}</b><br/>
                        <b>{showStage(3, t)}</b> <br/>
                        {t("prod")}  <b>{product[parseInt(parseInt(retLotStock[parseInt(lotId)-1].id_product))-1].simple ? "Simple" : "Complex"}</b> <br/>
                        {t("currentWeight")} <b>{parseInt(retLotStock[parseInt(lotId)-1].size)} Kg</b><br/>
                        {t("locationLot")}: <b>{retLotStock[parseInt(lotId)-1].location}</b><br/>
                        {Object.values(hashProd[parseInt(product[parseInt(retLotStock[parseInt(lotId)-1].id_product)-1].id)-1]).map(function (keys) {
                            x++;
                            return(
                                <div>
                                    File {x}: <a href={'https://gateway.pinata.cloud/ipfs/'+ keys} target='_blank' rel="noreferrer">{t("read")}</a>
                                </div>
                            )
                        })}
                    </p>
                </div>
            </div>
        )
    }
    const soldPart = () => {
        return(
            <div className='pb-1 pt-2 mb-4' style={{background: 'green', color: 'yellow', textAlign: 'center'}}>
                <h3>{t("sold")}</h3>
            </div>
        )
    }

    return(
        <div className='main mb-5'>
            <dev className='container'>
                <button onClick={redirect_to_list} className="ms-4 btn btn-danger" style={{ position: 'absolute', left: '35px', top: '40px' }}>{t("goToList")}</button>
                <h1 className='title'>{t("track")}</h1>
                <GB title="English" type='button' onClick={() => handleChangeLanguage("en")}  style={{position: 'absolute', right: '55px', top: '45px', height: '30px'}}/>
                <IT title="Italiano" type='button' onClick={() => handleChangeLanguage("it")}  style={{position: 'absolute', right: '120px', top: '45px', height: '30px'}}/>
            </dev>
            <br /><br/>
            
            <h1>{t("lotToTrack")} {product[parseInt(absoluteLot[absoluteId].id_product)-1].name}</h1>
            <p>
                {t("currentWeight")} <b> {parseInt(absoluteLot[absoluteId].size)} Kg </b><br/>
                Status: <b> {showStage(parseInt(absoluteLot[absoluteId].stage), t)}</b> <br/>
            </p>

            <div className="h4 pb-4 mb-4 border-bottom border-dark"></div>

            {getAction([parseInt(absoluteLot[absoluteId].stage)], lotId)}
        </div>
    )
    
}

function showStage(stage, t){
    switch(stage) {
        case 0:
            return (t("stage")+" "+t("sup"));
        case 1:
            return (t("stage")+" "+t("man"));
        case 2:
            return (t("stage")+" "+t("dis"));
        case 3:
            return (t("stage")+" "+t("ret"));
        case 4:
            return (t("sold"));
    }
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
    }
}

function showArrow(arr){
    if(arr.length != 0) return(
        <div style={{textAlign: "center", justifyContent: "center"}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" className="mb-5 bi bi-arrow-up-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293z"/>
            </svg>
        </div>
    )
}

export default Track
