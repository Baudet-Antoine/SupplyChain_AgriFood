// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

contract SupplyChain{
    // Smart Contract owner will be the person who deploys the contract only he can authorize various roles Supplier, Manufacturer, Distributor, Retailer
    address public Owner;

    uint256 public actorCtr;
    uint256 public productCtr;
    uint256 public absoluteCtr;
    uint256 public supLotCtr;
    uint256 public manLotCtr;
    uint256 public disLotCtr;
    uint256 public retLotCtr;
    uint256 public actionCtr;

    // note this constructor will be called when smart contract will be deployed on blockchain
    constructor() {
        Owner = msg.sender;
    }

    // modifier to make sure only the owner is using the function
    modifier onlyByOwner() {
        require(msg.sender == Owner);
        _;
    }

    modifier correctActor(ROLE _role){
        bool cond=false;
        for (uint256 i=0; i<=actorCtr; i++) {
            if((Actors[i].addr == msg.sender) && (Actors[i].role == _role) && (msg.sender != Owner)) cond=true;
        }
        require(cond);
        _;
    }

    // stages of a lot in supply chain
    enum STAGE {
        Supply,
        Manufacturing,
        Distribution,
        Retail,
        Sold
    }

    // roles for actor
    enum ROLE {
        Supplier,
        Manufacturer,
        Distributor,
        Retailer
    }

    // all possible action
    enum ACTION_TYPE {
        Manufacture,
        Distribution,
        Retail,
        Tranformation,
        Alteration,
        Integration,
        Division,
        Creation
    }

    struct product {
        uint256 id;
        string name;
        bool simple;
        bool active;
        uint256[] ingredient;
        string[] hashFileProduct;
    }

    struct lot{
        uint256 id; // unique lot id
        uint256 absolute_id; // id for that lot in all the supply-chain
        uint256 id_product; // lot of this product
        uint256 size; // size in kg of the lot
        string location; // location of the lot
        address actor; // id of the actor for this particular lot
    }

    struct absolute_lot{
        uint256 id; // unique lot id
        uint256 id_product; // lot of this product
        uint256 size;
        STAGE stage; // current lot stage
        bool active; //if it's active it means it's still the same lot
    }

    struct action{
        uint256 id;
        ACTION_TYPE actionType;
        uint256[] source;
        uint256[] sink;
        uint256 timestamp;
        uint256 duration;
        string hashFileAction;
    }

    struct actor {
        uint256 id;
        address addr;
        ROLE role;
        string name; 
        string place;
        string hashFileActor; 
    }

    mapping(uint256 => product) public ProductStock;
    mapping(uint256 => absolute_lot) public LotStock;
    mapping(uint256 => lot) public SupLotStock;
    mapping(uint256 => lot) public ManLotStock;
    mapping(uint256 => lot) public DisLotStock;
    mapping(uint256 => lot) public RetLotStock;
    mapping(uint256 => action) public Actions;
    mapping(uint256 => actor) public Actors;
    mapping(uint => uint) public elementCount;
    mapping (address => string) public userFiles;

    function setFile(string memory file) external {
        userFiles[msg.sender] = file;
    }

    function addActor(address _address, ROLE[] memory _role, string memory _name, string memory _place, string memory hashFileAcor) public onlyByOwner() {
        for(uint256 i=0; i<_role.length; i++){
            actorCtr++;
            Actors[actorCtr] = actor(actorCtr, _address, _role[i], _name, _place, hashFileAcor);
        }
    }

    function addProduct(string memory _name, uint256[] memory _ingredient, string[] memory hashFileProduct) public onlyByOwner() {
        productCtr++;
        bool simple = true;
        if (_ingredient.length != 0) simple = false;
        ProductStock[productCtr] = product(productCtr, _name, simple, true, _ingredient, hashFileProduct);
    }

    function deleteProd(uint256 _id) public onlyByOwner() {
        ProductStock[_id].active=false;
    } 

    function addLot(uint256 _prodId, uint256 _size, string memory _location) public {
        absoluteCtr++;
        supLotCtr++;
        actionCtr++;
        LotStock[absoluteCtr] = absolute_lot(absoluteCtr, _prodId, _size, STAGE.Supply, true);
        SupLotStock[supLotCtr] = lot(supLotCtr, absoluteCtr, _prodId, _size, _location, msg.sender);
        uint256[] memory source = new uint[](1);
        uint256[] memory sink = new uint[](1);
        sink[0] = supLotCtr;
        Actions[actionCtr] = action(actionCtr, ACTION_TYPE.Creation, source, sink, block.timestamp, 0, "");
    }

    function baseActions(uint256[] memory _source, string memory _location, ROLE _role, uint256 _duration, string memory hashFileAction) public correctActor(_role) {
        actionCtr++;
        uint256[] memory sink = new uint[](1);
        if (_role == ROLE.Manufacturer){
            require(LotStock[SupLotStock[_source[0]].absolute_id].stage == STAGE.Supply);
            manLotCtr++;
            sink[0] = manLotCtr;
            ManLotStock[manLotCtr] = lot(manLotCtr, SupLotStock[_source[0]].absolute_id, SupLotStock[_source[0]].id_product, SupLotStock[_source[0]].size, _location, msg.sender);
            LotStock[SupLotStock[_source[0]].absolute_id].stage = STAGE.Manufacturing;
            Actions[actionCtr] = action(actionCtr, ACTION_TYPE.Manufacture, _source, sink, block.timestamp, _duration, hashFileAction);
        } else if (_role == ROLE.Distributor){
            require(LotStock[ManLotStock[_source[0]].absolute_id].stage == STAGE.Manufacturing);
            disLotCtr++;
            sink[0] = disLotCtr;
            DisLotStock[disLotCtr] = lot(disLotCtr, ManLotStock[_source[0]].absolute_id, ManLotStock[_source[0]].id_product, ManLotStock[_source[0]].size, _location, msg.sender);
            LotStock[ManLotStock[_source[0]].absolute_id].stage = STAGE.Distribution;
            Actions[actionCtr] = action(actionCtr, ACTION_TYPE.Distribution, _source, sink, block.timestamp, _duration, hashFileAction);
        } else if (_role == ROLE.Retailer){
            require(LotStock[DisLotStock[_source[0]].absolute_id].stage == STAGE.Distribution);
            retLotCtr++;
            sink[0] = retLotCtr;
            RetLotStock[retLotCtr] = lot(retLotCtr, DisLotStock[_source[0]].absolute_id, DisLotStock[_source[0]].id_product, DisLotStock[_source[0]].size, _location, msg.sender);
            LotStock[DisLotStock[_source[0]].absolute_id].stage = STAGE.Retail;
            Actions[actionCtr] = action(actionCtr, ACTION_TYPE.Retail, _source, sink, block.timestamp, _duration, hashFileAction);
        }
    }

    function sellLot(uint256 _absoluteId) public {
        bool cond=false;
        for (uint256 i=0; i<=actorCtr; i++) {
            if((Actors[i].addr == msg.sender) && (Actors[i].role == ROLE.Retailer)) cond=true;
        }  
        require(cond);
        LotStock[_absoluteId].stage = STAGE.Sold;
    }

    function destruction(uint256 _absoluteId) public {
        require(LotStock[_absoluteId].stage != STAGE.Sold);
        if (LotStock[_absoluteId].stage >= STAGE.Supply){
            for (uint256 i=0; i<=supLotCtr; i++) {
                if (SupLotStock[i].absolute_id == _absoluteId) require(SupLotStock[i].actor==msg.sender);
            }
        }
        if (LotStock[_absoluteId].stage >= STAGE.Manufacturing) {
            for (uint256 i=0; i<=manLotCtr; i++) {
                if (ManLotStock[i].absolute_id == _absoluteId) require(ManLotStock[i].actor==msg.sender);
            }
        }
        if (LotStock[_absoluteId].stage >= STAGE.Distribution){
            for (uint256 i=0; i<=disLotCtr; i++) {
                if (DisLotStock[i].absolute_id == _absoluteId) require(DisLotStock[i].actor==msg.sender);
            }
        }
        if (LotStock[_absoluteId].stage >= STAGE.Retail){
            for (uint256 i=0; i<=retLotCtr; i++) {
                if (RetLotStock[i].absolute_id == _absoluteId) require(DisLotStock[i].actor==msg.sender);
            }
        }
        for (uint256 i=1; i<=actionCtr; i++){
            if ((Actions[i].actionType == ACTION_TYPE.Manufacture) || (Actions[i].actionType == ACTION_TYPE.Alteration) || (Actions[i].actionType == ACTION_TYPE.Tranformation)){
                if (ManLotStock[Actions[i].sink[0]].absolute_id == _absoluteId) delete Actions[i];
            } 
            else if (Actions[i].actionType == ACTION_TYPE.Division){
                if (ManLotStock[Actions[i].source[0]].absolute_id == _absoluteId) delete Actions[i];
                for (uint256 j=0; j<=Actions[i].sink.length; j++) {
                    if (ManLotStock[Actions[i].sink[j]].absolute_id == _absoluteId) delete Actions[i];
                }
            } 
            else if (Actions[i].actionType == ACTION_TYPE.Integration){
                if (ManLotStock[Actions[i].sink[0]].absolute_id == _absoluteId) delete Actions[i];
                for (uint256 j=0; j<=Actions[i].source.length; j++) {
                    if (ManLotStock[Actions[i].source[j]].absolute_id == _absoluteId) delete Actions[i];
                }
            } 
            else if (Actions[i].actionType == ACTION_TYPE.Distribution) {
                if (DisLotStock[Actions[i].sink[0]].absolute_id == _absoluteId) delete Actions[i];
            }
            else if (Actions[i].actionType == ACTION_TYPE.Retail){
                if (RetLotStock[Actions[i].sink[0]].absolute_id == _absoluteId) delete Actions[i];
            }
        }
        if (LotStock[_absoluteId].stage >= STAGE.Supply){
            for (uint256 i=0; i<=supLotCtr; i++) {
                if (SupLotStock[i].absolute_id == _absoluteId) delete SupLotStock[i];
            }
        }
        if (LotStock[_absoluteId].stage >= STAGE.Manufacturing) {
            for (uint256 i=0; i<=manLotCtr; i++) {
                if (ManLotStock[i].absolute_id == _absoluteId) delete ManLotStock[i];
            }
        }
        if (LotStock[_absoluteId].stage >= STAGE.Distribution){
            for (uint256 i=0; i<=disLotCtr; i++) {
                if (DisLotStock[i].absolute_id == _absoluteId) delete DisLotStock[i];
            }
        }
        if (LotStock[_absoluteId].stage >= STAGE.Retail){
            for (uint256 i=0; i<=retLotCtr; i++) {
                if (RetLotStock[i].absolute_id == _absoluteId) delete RetLotStock[i];
            }
        }
        delete LotStock[_absoluteId];
    }

    function transform(uint256[] memory _source, uint256 _idProd, uint256 _size, string memory _location, uint256 _duration, string memory hashFileAction) public {
        bool cond=false;
        uint256[] memory sink = new uint256[](1);
        for(uint256 i=0; i<=manLotCtr; i++){
            if((LotStock[ManLotStock[i].absolute_id].active) && (ManLotStock[i].absolute_id == ManLotStock[_source[0]].absolute_id) && (ManLotStock[i].actor == msg.sender)){
                cond=true;
            }
        }
        LotStock[ManLotStock[_source[0]].absolute_id].active=false;
        actionCtr++;
        manLotCtr++;
        absoluteCtr++;
        sink[0] = manLotCtr;
        LotStock[absoluteCtr] = absolute_lot(absoluteCtr, _idProd, _size, STAGE.Manufacturing, true);
        ManLotStock[manLotCtr] = lot(manLotCtr, absoluteCtr, _idProd, _size, _location, msg.sender);
        Actions[actionCtr] = action(actionCtr, ACTION_TYPE.Tranformation, _source, sink, block.timestamp, _duration, hashFileAction);
    }

    function integrate(uint256[] memory _absoluteIds, uint256 productId, string memory _location, uint256 _duration, string memory hashFileAction) public {
        uint256 count=0;
        uint256 size = 0;
        uint256[] memory sink = new uint256[](1);
        uint256[] memory source = new uint256[](_absoluteIds.length);

        for(uint256 i=0; i<=manLotCtr; i++){
            for (uint j=0; j < _absoluteIds.length; j++) {
                if ((ManLotStock[i].absolute_id == _absoluteIds[j]) && (LotStock[_absoluteIds[j]].active)) {
                    source[count] = ManLotStock[i].id;
                    count++;
                    break;
                }
            }
        }

        for (uint256 i = 0; i < _absoluteIds.length; i++) {
            LotStock[_absoluteIds[i]].active = false;
            size += LotStock[_absoluteIds[i]].size;  
        }
        
        manLotCtr++;
        absoluteCtr++;
        actionCtr++;
        sink[0] = manLotCtr;
        ManLotStock[manLotCtr] = lot(manLotCtr, absoluteCtr, productId, size, _location, msg.sender);
        LotStock[absoluteCtr] = absolute_lot(absoluteCtr, productId, size, STAGE.Manufacturing, true);
        
        Actions[actionCtr] = action(actionCtr, ACTION_TYPE.Integration, source, sink, block.timestamp, _duration, hashFileAction);
    }

    function division(uint256 _absLotId, uint256[] memory _sizes, string memory _location, uint256 _duration, string memory hashFileAction) public {
        uint256 sum;
        actionCtr++;
        uint256[] memory source = new uint256[](1);
        uint256[] memory sink = new uint256[](_sizes.length);
        for (uint256 i=0; i<_sizes.length; i++){
            sum += _sizes[i];
        }   
        require(sum <= LotStock[_absLotId].size);
        for (uint256 i=0; i<=manLotCtr; i++){
            if((LotStock[ManLotStock[i].absolute_id].active==true) && (ManLotStock[i].absolute_id == _absLotId)) {
                require(ManLotStock[i].actor==msg.sender);
                source[0] = ManLotStock[i].id;
            }
        }
        for (uint256 i=0; i<_sizes.length; i++){
            manLotCtr++;
            absoluteCtr++;
            sink[i]=manLotCtr;
            ManLotStock[manLotCtr] = lot(manLotCtr, absoluteCtr, LotStock[_absLotId].id_product, _sizes[i], _location, msg.sender);
            LotStock[absoluteCtr] = absolute_lot(absoluteCtr, LotStock[_absLotId].id_product, _sizes[i], STAGE.Manufacturing, true);
        }  
        Actions[actionCtr] = action(actionCtr, ACTION_TYPE.Division, source, sink, block.timestamp, _duration, hashFileAction);
        LotStock[_absLotId].active = false;
    }

    function getProductIngredient(uint256 _productId) public view returns (uint256[] memory) {
        return ProductStock[_productId].ingredient;
    }

    function getProductHahs(uint256 _productId) public view returns (string[] memory) {
        return ProductStock[_productId].hashFileProduct;
    }

    function getSourceAction(uint256 _actionId) public view returns (uint256[] memory){
        return Actions[_actionId].source;
    }

    function getSinkAction(uint256 _actionId) public view returns (uint256[] memory){
        return Actions[_actionId].sink;
    }

    function checkArray(uint256[] memory array1, uint256[] memory array2) internal returns(bool){
        for (uint i = 0; i < array1.length; i++) {
            elementCount[array1[i]]=0;
        }
        for (uint i = 0; i < array2.length; i++) {
            elementCount[array2[i]]=0;
        }
        if (array1.length != array2.length) {
            return false;
        }
        for (uint i = 0; i < array1.length; i++) {
            elementCount[array1[i]]++;
        }
        for (uint i = 0; i < array2.length; i++) {
            elementCount[array2[i]]--;
        }
        for (uint i = 0; i < array1.length; i++) {
            if (elementCount[array1[i]] != 0) {
                return false;
            }
        }
        return true;
    }
}