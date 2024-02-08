import React, { useState, useEffect } from 'react'
import Select from 'react-select';
import Button from 'react-bootstrap/Button';
import Modal from 'react-overlays/Modal';
import { useNavigate } from "react-router-dom"
import Web3 from "web3";
import SupplyChainABI from "./artifacts/SupplyChain.json"
import axios from "axios";
import { useTranslation } from "react-i18next";
import { IT, GB } from 'country-flag-icons/react/3x2'

function PerformAction() {

    const [t, i18n] = useTranslation("translation");
    const handleChangeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    } 

    const name_ingr = [];
    const supply_action = [];
    const possible_actions = [];
    const item = [];

    const history = useNavigate()
    useEffect(() => {
        loadWeb3();
        loadBlockchaindata();
    }, [])

    const [currentaccount, setCurrentaccount] = useState("");
    const [loader, setloader] = useState(true);
    const [supplyChain, setSupplyChain] = useState();
    const [product, setProduct] = useState();
    const [productId, setProductId] = useState(-1);
    const [absoluteLot, setAbsoluteLot] = useState();
    const [lotSize, setLotSize] = useState();
    const [lotLoaction, setLotLocation] = useState();
    const [actors, setActors] = useState();
    const [show, setShow] = useState(false);
    const [actionType, setActionType] = useState();
    const [actionDuration, setActionDuration] = useState();
    const [absoluteLotId, setAbsoluteLotId] = useState(0);
    const [supLotStock, setSupLotStock] = useState();
    const [manLotStock, setManLotStock] = useState();
    const [disLotStock, setDisLotStock] = useState();
    const [retLotStock, setRetLotStock] = useState();
    const [possibleIngr, setPossibleIngr] = useState([])
    const [integrationInput, setIntegrationInput] = useState([]);
    const [actionFile, setActionFile] = useState("");

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
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        setCurrentaccount(account);
        const networkId = await web3.eth.net.getId();
        const networkData = SupplyChainABI.networks[networkId];
        if (networkData) {
            const supplychain = new web3.eth.Contract(SupplyChainABI.abi, networkData.address);
            setSupplyChain(supplychain);
            const actCtr = await supplychain.methods.actorCtr().call();
            const act = {};
            for (let i = 0; i < actCtr; i++) {
                act[i] = await supplychain.methods.Actors(i + 1).call();
            }
            const prodCtr = await supplychain.methods.productCtr().call();
            const prod = {};
            for (let i = 0; i < prodCtr; i++) {
                prod[i] = await supplychain.methods.ProductStock(i + 1).call();
            }
            const absoluteCtr = await supplychain.methods.absoluteCtr().call();
            const lot = {};
            for (let i = 0; i < absoluteCtr; i++) {
                lot[i] = await supplychain.methods.LotStock(i + 1).call();
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

    const redirect_to_track = (event) => {
        let arr=[]
        arr.push(parseInt(event.target.value))
        switch (parseInt(absoluteLot[event.target.value].stage)) {
            case 0:
                for(let i=0; i<Object.keys(supLotStock).length; i++){
                    if(parseInt(supLotStock[i].absolute_id) == (parseInt(event.target.value)+1)){
                        arr[1] = parseInt(supLotStock[i].id);
                        break;
                    }
                }
                break;
            case 1:
                for(let i=0; i<Object.keys(manLotStock).length; i++){
                    if(parseInt(manLotStock[i].absolute_id) == (parseInt(event.target.value)+1)){
                        arr[1] = parseInt(manLotStock[i].id);
                        break;
                    }
                }
                break;
            case 2:
                for(let i=0; i<Object.keys(disLotStock).length; i++){
                    if(parseInt(disLotStock[i].absolute_id) == (parseInt(event.target.value)+1)){
                        arr[1] = parseInt(disLotStock[i].id);
                        break;
                    }
                }
                break;
            case 3: case 4:
                for(let i=0; i<Object.keys(retLotStock).length; i++){
                    if(parseInt(retLotStock[i].absolute_id) == (parseInt(event.target.value)+1)){
                        arr[1] = parseInt(retLotStock[i].id);
                        break;
                    }
                }
                break;
        }
        history("/track", {state: arr});
    }
    const redirect_to_home = () => {
        history('/');
    }
    const handlerProductID = (event) => {
        if(parseInt(event.target.value)>= 1) setProductId(parseInt(event.target.value));
    }
    const handlerLotSize = (event) => {
        setLotSize(event.target.value);
    }
    const handlerLotLocation = (event) => {
        setLotLocation(event.target.value);
    }
    const handlerCreateLot = async (event) => {
        event.preventDefault();
        let arr = showActorRole(actors, currentaccount, t);
        try {
            if(arr.includes("Supplier")){
                var reciept = await supplyChain.methods.addLot(productId, lotSize, lotLoaction).send({ from: currentaccount });
                if (reciept) {
                    loadBlockchaindata();
                }
            } else {
                alert(t("supAlert"));
            }
        }
        catch (err) {
            alert(t("errAlert"))
        }
    }
    const handleSelectAction = (event) => {
        setActionType(event.target.value);
    }
    const handlerChangeDuration = (event) => {
        setActionDuration(event.target.value);
    }
    const handlerChangeLocation = (event) => {
        setLotLocation(event.target.value);
    }
    const handleChangeIntegration = (event) => {
        let temp=[];
        for (let i =0; i<Object.keys(absoluteLot).length; i++){
            if(parseInt(absoluteLot[i].id) == (absoluteLotId+1)) temp.push(parseInt(absoluteLot[i].id));
        }
        for (let index = 0; index < event.length; index++) {
            temp.push(parseInt(event[index].absVal));
        }
        setIntegrationInput(temp);
    }
    const handleChangeDivision = (event) => {
        setPossibleIngr(Array.from({ length: event.target.value }));
    }
    const handleNewWeights = (event) => {
        item.push(parseInt(event.target.value));
    }
    const handleShow = (event) => {
        let index = parseInt(event.target.value);
        let temp= [];
        setProductId(parseInt(absoluteLot[index].id_product))
        setAbsoluteLotId(index);
        setPossibleIngr([]);
        for (let i = 0; i < Object.keys(absoluteLot).length; i++) {
            if ((absoluteLot[i].active) && (parseInt(absoluteLot[i].stage) == 1)&& (parseInt(absoluteLot[i].id) != parseInt(absoluteLot[index].id))) {
                temp.push({value: parseInt(product[parseInt(absoluteLot[i].id_product)-1].id), label: product[parseInt(absoluteLot[i].id_product)-1].name, absVal: parseInt(absoluteLot[i].id)});
            }
        }
        setPossibleIngr(temp)
        setShow(true);
    }
    const handleClose = () => {
        setActionType(-1);
        setShow(false)};
    const getHash = async (file) => {
        const actionFileData = new FormData();
        actionFileData.append("file", file);
        const response = await axios({
            method: "post",
            url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
            data: actionFileData,
            headers: {
                'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY,
                'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET_KEY,
                "Content-Type": "multipart/form-data"
            }
        })
        return response.data.IpfsHash;
    }
    const handleSaveClose = async (event) => {
        event.preventDefault();
        var reciept;
        var index;
        const temp = [];
        let responseData;

        if(actionFile != "") {
            const val = await Promise.all([getHash(actionFile)]).then((values) => {
                return values;
            });
            responseData = val[0];
        }

        try {
            switch (parseInt(actionType)) {
                case 0: // Manufacturing
                    for(let i=0; i<Object.keys(supLotStock).length; i++){
                        if (parseInt(supLotStock[i].absolute_id) == (parseInt(absoluteLotId)+1)) index = parseInt(supLotStock[i].id);
                    }
                    temp.push(index);
                    reciept = await supplyChain.methods.baseActions(temp, lotLoaction, 1, parseInt(actionDuration), responseData).send({ from: currentaccount });
                    break;
                case 1: // Distribution
                    for(let i=0; i<Object.keys(manLotStock).length; i++){
                        if (parseInt(manLotStock[i].absolute_id) == (parseInt(absoluteLotId)+1)) index = parseInt(manLotStock[i].id);
                    }
                    temp.push(index);
                    reciept = await supplyChain.methods.baseActions(temp, lotLoaction, 2, parseInt(actionDuration), responseData).send({ from: currentaccount });
                    break;
                case 2: // Retailing
                    for(let i=0; i<Object.keys(disLotStock).length; i++){
                        if (parseInt(disLotStock[i].absolute_id) == (parseInt(absoluteLotId)+1)) index = parseInt(disLotStock[i].id);
                    }
                    temp.push(index);
                    reciept = await supplyChain.methods.baseActions(temp, lotLoaction, 3, parseInt(actionDuration), responseData).send({ from: currentaccount });
                    break;
                case 3: // Transformation
                    for(let i=0; i<Object.keys(manLotStock).length; i++){
                        if (parseInt(manLotStock[i].absolute_id) == (parseInt(absoluteLotId)+1)) index = parseInt(manLotStock[i].id);
                    }
                    temp.push(index);
                    reciept = await supplyChain.methods.transform(temp, lotLoaction, parseInt(actionDuration), responseData).send({ from: currentaccount });
                    break;
                case 4: // Alteration
                    break;
                case 5: // Integration
                    reciept = await supplyChain.methods.integrate(integrationInput, lotLoaction, parseInt(actionDuration), responseData).send({ from: currentaccount });
                    break;
                case 6: // Division
                    reciept = await supplyChain.methods.division((parseInt(absoluteLotId)+1), item, lotLoaction, parseInt(actionDuration), responseData).send({ from: currentaccount });
                    break;
                case 7: // Destruction
                    reciept = await supplyChain.methods.destruction(parseInt(absoluteLotId)+1).send({ from: currentaccount });  
                    break;
                case 8: // sell
                    reciept = await supplyChain.methods.sellLot(parseInt(absoluteLotId)+1).send({ from: currentaccount });
                    break;
            }
            if (reciept) {
                loadBlockchaindata();
            }
        } catch (err) {
            console.log(err)
            alert(t("errAlert"))
        }
        setActionType(-1)
        setShow(false);
    }

    const handlerChangeTrans = (event) => {
        const content = event.target.value;
        const file = new File([content], "transform.txt" ,{ type: 'text/plain' });
        setActionFile(file);
    }
    
    for (let i = 0; i < Object.keys(product).length; i++) {
        if(product[i].name != "" && product[i].simple){
            name_ingr.push({value: product[i].id, label: product[i].name})
        }
    }
    
    const displayAction = () => {
        let man_action = [];
        let dis_action = [];
        let ret_action = [];
        if(absoluteLotId==0) return [];
        else{
            switch (parseInt(absoluteLot[absoluteLotId].stage)) {
                case 0:
                    supply_action = [{value: 7, label: t("destruction")}]
                    man_action = [
                        {value: 0, label: t("manufacture")},
                        {value: 7, label: t("destruction")}
                    ]
                    break;
            
                case 1:
                    man_action = [
                        {value: 3, label: t("transformation")},
                        {value: 5, label: t("integration")},
                        {value: 6, label: t("division")},
                        {value: 7, label: t("destruction")},
                    ]
                    dis_action = [
                        {value: 1, label: t("distribute")},
                        {value: 7, label: t("destruction")}
                    ]
                    break;
                case 2:
                    ret_action = [
                        {value: 2, label: t("retail")},
                        {value: 7, label: t("destruction")}
                    ]
                    break;
                case 3:
                    ret_action = [
                        {value: 8, label: t("sell")},
                        {value: 7, label: t("destruction")}
                    ]
                    break;
            }
        }
        return [supply_action, man_action, dis_action, ret_action]
    }

    const total_actions = displayAction();

    for (let i = 0; i < Object.keys(actors).length; i++) {
        if(actors[i].addr == currentaccount) {
            for (let j=0; j<total_actions[parseInt(actors[i].role)].length; j++){
                possible_actions.push(total_actions[parseInt(actors[i].role)][j]);
            }
        }
    }

    return(
        <div className='main'>
            <dev className='container'>
                <button onClick={redirect_to_home} className="ms-4 btn btn-danger" style={{ position: 'absolute', left: '35px', top: '40px' }}>HOME</button>
                <h1 className='title'>{t("manageLot")}</h1>
                <GB title="English" type='button' onClick={() => handleChangeLanguage("en")}  style={{position: 'absolute', right: '55px', top: '45px', height: '30px'}}/>
                <IT title="Italiano" type='button' onClick={() => handleChangeLanguage("it")}  style={{position: 'absolute', right: '120px', top: '45px', height: '30px'}}/>
            </dev>
            <br /><br/>
            <span>
                <b>{t("currentAddr")}</b> {currentaccount}
                <br/>
                <b>{t("roleAcc")}</b> {showActorRole(actors, currentaccount, t)}
            </span>

            <br/><br/><br/>

            <h6>{t("addLot")}</h6>
            <form onSubmit={handlerCreateLot}>
                <div className='form mb-3'> 
                    <select className="form-select" onChange={handlerProductID} required> 
                        <option value="" defaultValue={'DEFAULT'} >{t("chooseProduct")}</option>
                        {name_ingr.map(function(item){
                            if (product[parseInt(item.value)-1].simple && product[parseInt(item.value)-1].active) return (<option value={item.value}>{item.label}</option>)
                        })}
                    </select>
                </div> 
                <div className="form-floating mb-3">
                    <input type="number" className="form-control" id="floatingSize" onChange={handlerLotSize} placeholder='ciao' required/>
                    <label for="floatingSize">{t("sizeLot")}</label>
                </div> 
                <div className="form-floating mb-3">
                    <input type="text" className="form-control" id="floatingLocation" onChange={handlerLotLocation} placeholder='ciao' required/>
                    <label for="floatingLocation">{t("locationLot")}</label>
                </div>     
                <div className='mb-3 disabled' style={{textAlign: 'center'}} title={(showActorRole(actors, currentaccount, t) != t("sup")) ? t("limit") : ""}>
                    <button className="me-1 btn btn-success"  disabled={(showActorRole(actors, currentaccount, t).includes(t("sup"))) ? false : true} onSubmit={handlerCreateLot} style={{width: '10cm', fontWeight: 'bold'}}>{t("create")}</button>
                </div>  
                     
            </form>

            <br/><br/>
            
            <h6></h6>
            <table className="mb-5 table table-sm">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">{t("prodLot")}</th>
                        <th scope='col'>Status</th>
                        <th scope='col'>{t("locationLot")}</th>
                        <th scope="col"></th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(absoluteLot).map(function (key) {
                        if (absoluteLot[key].active){
                            return (
                                <tr key={key}>
                                    <td>{parseInt(absoluteLot[key].id)}</td>
                                    <td>{product[parseInt(absoluteLot[key].id_product)-1].name}</td>
                                    <td>{showStage(parseInt(absoluteLot[key].stage), t)}</td>
                                    <td>{showLocation(parseInt(absoluteLot[key].id), absoluteLot, supLotStock, manLotStock, disLotStock, retLotStock,t)}</td>
                                    <td><Button disabled={(absoluteLot[key].stage == 4) ? true : false} value={key} className="btn btn-dark bg-green text-yellow btn-sm" onClick={handleShow}>{t("perform")}</Button></td>
                                    <td><Button value={key} className="btn btn-primary btn-sm" onClick={redirect_to_track}>{t("track")}</Button></td>
                                </tr>
                            )
                        }
                    })}
                </tbody>
            </table>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{t("manageLot")}: {productId == -1 ? "" : product[parseInt(productId)-1].name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <select className="form-select" onChange={handleSelectAction} required> 
                        <option value="" defaultValue={'DEFAULT'} >{t("chooseAction")}</option>
                        {possible_actions.map((item) => (
                            <option value={item.value}>{item.label}</option>
                        ))}
                    </select>
                    {
                        actionType >= 0 && actionType <= 4 && actionType != 3 &&
                        <div>
                            <div className="form-floating mb-3 mt-3">
                                <input type="text" className="form-control" id="floatingLocation" onChange={handlerChangeLocation} placeholder="New location in warehouse" required/>
                                <label for="floatingLocation">{t("locationLot")}</label>
                            </div>
                            <div className="form-floating mb-3">
                                <input type="number" className="form-control" id="floatingDuration" onChange={handlerChangeDuration} placeholder="Duration of the action (in min)" required/>
                                <label for="floatingDuration">{t("duration")}</label>
                            </div> 
                            <div className="mb-3">
                                <label for="for-file">{t("describeAction")}</label>
                                <input id="form-file" className="form-control " type="file" onChange={(e)=>setActionFile(e.target.files[0])} required/>
                            </div>  
                        </div>
                    }
                    {
                        actionType == 3 && //tranformation
                        <div>
                            <div className="form-floating mb-3 mt-3">
                                <input type="text" className="form-control" id="floatingLocation" onChange={handlerChangeLocation} placeholder="New location in warehouse" required/>
                                <label for="floatingLocation">{t("locationLot")}</label>
                            </div>
                            <div className="form-floating mb-3">
                                <input type="number" className="form-control" id="floatingDuration" onChange={handlerChangeDuration} placeholder="Duration of the action (in min)" required/>
                                <label for="floatingDuration">{t("duration")}</label>
                            </div> 
                            <div className="mb-3">
                                <label for="for-file">{t("describeAction")}</label>
                                <textarea id="form-file" className="form-control " type="text" onChange={handlerChangeTrans} required/>
                            </div>  
                        </div>
                    }
                    {
                        actionType == 5 && //integration
                        <div>
                            <br/>
                            <Select 
                                isMulti
                                name="colors"
                                options={possibleIngr}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                autoFocus={true} 
                                onChange={handleChangeIntegration}
                            />
                            <div className="form mb-3 mt-3">
                                <label >{t("locationLot")}</label>
                                <input type="text" className="form-control" id="floatingLocation" onChange={handlerChangeLocation} required/>
                            </div>
                            <div className="form mb-3">
                                <label for="floatingDuration">{t("duration")}</label>
                                <input type="number" className="form-control" id="floatingDuration" onChange={handlerChangeDuration} required/>
                            </div> 
                            <div className="form mb-3">
                                <label for="floatingDuration">{t("describeAction")}</label>
                                <input className="mt-2 form-control " type="file" id="formFile" onChange={(e)=>setActionFile(e.target.files[0])} required/>
                            </div> 
                        </div>
                    }
                    {
                        actionType == 6 && //division
                        <div>
                            <br/>
                            Weight of current lot: <b>{parseInt(absoluteLot[absoluteLotId].size)}</b> kg
                            <div className="form mb-3 mt-3">
                                <label >{t("locationLot")}</label>
                                <input type="text" className="form-control" id="floatingLocation" onChange={handlerChangeLocation} required/>
                            </div>
                            <div className="form mb-3">
                                <label for="floatingDuration">{t("duration")}</label>
                                <input type="number" className="form-control" id="floatingDuration" onChange={handlerChangeDuration} required/>
                            </div> 
                            <div className="form mb-3">
                                <label for="floatingDuration">{t("numberLot")}</label>
                                <input className="mt-2 me-1 form-control" type="number" onChange={handleChangeDivision} required />
                            </div> 
                            <div className="form mb-3">
                                <label for="floatingDuration">{t("describeAction")}</label>
                                <input className="mt-2 form-control " type="file" id="formFile" onChange={(e)=>setActionFile(e.target.files[0])} required/>
                            </div> 
                            {possibleIngr.map((_, index) => (
                                <div key={index}>
                                    <label>Weight (Kg) of new lot #{index + 1}</label>
                                    <input className="mt-2 ms-2" type="number" onChange={handleNewWeights} required />
                                    <br/>
                                </div>
                            ))}
                        </div>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        {t("close")}
                    </Button>
                    <Button variant="warning" onClick={handleSaveClose}>
                        {t("perform")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

function showActorRole(arr1, addr, t) {
    let cond=false;
    var possibility = [t("sup"), t("man"), t("dis"), t("ret")];
    var output=[];
    for (let index = 0; index < Object.keys(arr1).length; index++) {
        if (arr1[index].addr == addr){
            if (cond) output.push( " / ");
            output.push(possibility[arr1[index].role]);
            cond=true;
        }
    }
    if (addr === process.env.REACT_APP_OWNER_ADDRESS) {
        output.push(t("own"))
    } else if (output.length == 0){
        output.push(t("notReg"));
    }
    return output;
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

function showLocation(absId, absoluteLot, supLotStock, manLotStock, disLotStock, retLotStock, t) {
    let index;
    switch (parseInt(absoluteLot[absId-1].stage)) {
        case 0:
            for (let i=0; i<Object.keys(supLotStock).length; i++){
                if(parseInt(supLotStock[i].absolute_id) == absId) index=parseInt(supLotStock[i].id);
            }
            return supLotStock[index-1].location;
        case 1:
            for (let i=0; i<Object.keys(manLotStock).length; i++){
                if(parseInt(manLotStock[i].absolute_id) == absId) index=parseInt(manLotStock[i].id);
            }
            return manLotStock[index-1].location;
        case 2:
            for (let i=0; i<Object.keys(disLotStock).length; i++){
                if(parseInt(disLotStock[i].absolute_id) == absId) index=parseInt(disLotStock[i].id);
            }
            return disLotStock[index-1].location;
        case 3:
            for (let i=0; i<Object.keys(retLotStock).length; i++){
                if(parseInt(retLotStock[i].absolute_id) == absId) index=parseInt(retLotStock[i].id);
            }
            return retLotStock[index-1].location;
        case 4:
            return t("cust");
    }
}

export default PerformAction;