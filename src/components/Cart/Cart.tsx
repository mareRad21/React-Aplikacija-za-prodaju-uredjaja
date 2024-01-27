import React from "react";
import CartType from "../../types/CartType";
import api , {ApiResponse} from '../../api/api';
import { Alert, Button, Form, Modal, Nav, Table} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartArrowDown, faMinusSquare } from "@fortawesome/free-solid-svg-icons";

interface CartState{
    quantity: number,
    cart?: CartType;
    visible: boolean;
    message: string;
    cartManuColor: string;
}

export default class Cart extends React.Component {
    state: CartState;

    constructor(props: Readonly<{}>) {
        super(props);

        this.state = {
            quantity: 0,
            visible: false,
            message: '',
            cartManuColor: '#000000'
        };
        
    }

    componentDidMount() {
        this.updateCart();
        window.addEventListener("cart.update", () => this.updateCart());
    }

    componentWillUnmount() {
        window.removeEventListener("cart.update", () => this.updateCart());
    }

    private setStateQuantity(newQuantity: number){
        this.setState(Object.assign(this.state, {
            quantity: newQuantity,
        }));
    }

    private setStateCart (newCart?: CartType) {
        this.setState(Object.assign(this.state, {
            cart: newCart,
        }));
    }

    private setStateVisible (newState :boolean) {
        this.setState(Object.assign(this.state, {
            visible: newState, 
        }));
    }

    private setStateMessage(newMessage: string) {
        this.setState(Object.assign(this.state,{
            message: newMessage,
        }));
    }

    private setStateManuColor(newColor:string){
        this.setState(Object.assign(this.state,{
            cartManuColor: newColor,
        }));
    }

    private updateCart(){
        api('/api/user/cart/', 'get', {})
        .then((res: ApiResponse) =>{
            if(res.status === 'error' || res.status === 'login') {
                this.setStateQuantity(0);
                this.setStateCart(undefined);
                return;
            }

            this.setStateCart(res.data);
            this.setStateQuantity(res.data.cartArticles.length);

            this.setStateManuColor('#FF0000');
            setTimeout(()=> this.setStateManuColor('#000000'),2000);
        });
    }

    private calculateSum(): number {
        let sum: number = 0;

        if(this.state.cart === undefined){
            return sum;
        } else{
            for (const item of this.state.cart?.cartArticles){
                sum += Number(item.article.articlePrices[item.article.articlePrices.length-1].price * item.quantity);
            }
            return sum;
        }
    }
    private sendCartUpdate(data: any){
        api('/api/user/cart/','patch', data)
        .then((res: ApiResponse) => {
            if(res.status==='error' || res.status==='login'){
                this.setStateQuantity(0);
                this.setStateCart(undefined);
                return;
            }
            this.setStateCart(res.data);
            this.setStateQuantity(res.data.cartArticles.length);

        });
    }

    private updateQuantity(event: React.ChangeEvent<HTMLInputElement>){
        const articleId = event.target.dataset.articleId;
        const newQuantity = event.target.value;

        const data = {
            articleId: Number(articleId),
            quantity: Number(newQuantity),
        };
        this.sendCartUpdate(data);       
    }

    private removeFromCart(articleId: number){
        this.sendCartUpdate({
            articleId: articleId,
            quantity: 0,
        });
    }

    private makeOrder(){
        api('/api/user/cart/makeOrder/','post',{})
        .then((res:ApiResponse)=>{
            if(res.status === 'error' || res.status ==='login'){
                this.setStateQuantity(0);
                this.setStateCart(undefined);
                return;
            }
            this.setStateMessage('Your order has been made!');
            this.setStateCart(undefined);
            this.setStateQuantity(0);
            
        });
    }

    private hideCart(){
        this.setStateMessage('');
        this.setStateVisible(false);
    }

    render() {
        const sum = this.calculateSum();
        return(
            <>
                <Nav.Item>
                    <Nav.Link active={false} onClick={() => this.setStateVisible(true)} style={{color:this.state.cartManuColor}}>
                        <FontAwesomeIcon icon={faCartArrowDown} /> ( {this.state.quantity})
                    </Nav.Link>
                </Nav.Item>
                <Modal size='lg' centered show={this.state.visible} onHide={()=> this.hideCart()}>
                    <Modal.Header closeButton>
                        <Modal.Title>Your shopping cart</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table hover size="sm">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Article </th>
                                    <th className="text-end">Quantity</th>
                                    <th className="text-end">Price</th>
                                    <th className="text-end">Total</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.cart?.cartArticles.map(item => {
                                    return(
                                        <tr>
                                            <td>{item.article.category.name}</td>
                                            <td>{item.article.name}</td>
                                            <td className="text-end">
                                                <Form.Control type="number" step="1" min="1" value={item.quantity}
                                                                data-article-id={ item.article.articleId}
                                                                onChange={ (e) => this.updateQuantity(e as any)}>
                                                </Form.Control> 
                                            </td>
                                            <td className="text-end">{Number(item.article.articlePrices[item.article.articlePrices.length-1].price).toFixed(2)} EUR</td>
                                            <td className="text-end">{Number(item.article.articlePrices[item.article.articlePrices.length-1].price * item.quantity).toFixed(2)} EUR</td>
                                            <td>
                                                <FontAwesomeIcon icon={faMinusSquare} onClick={()=> this.removeFromCart(item.article.articleId)} />
                                            </td>
                                        </tr>
                                    )
                                }, this)}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td className="text-end">
                                      <strong> Total: </strong> 
                                    </td>
                                    <td className="text-end"> {Number(sum).toFixed(2)} EUR</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </Table>
                        <Alert variant="success" className={this.state.message ? '': 'd-none'}>
                            {this.state.message}
                        </Alert>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={()=> this.makeOrder()} disabled={this.state.cart?.cartArticles.length === 0}> 
                            Make an order 
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
 }