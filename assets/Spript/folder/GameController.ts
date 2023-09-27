import { _decorator, BoxCollider2D, Camera, Canvas, CCFloat, CCInteger, cclegacy, Collider2D, Component, Contact2DType, Graphics, Input, input, instantiate, IPhysics2DContact, Line, misc, Node, Prefab, Quat, RigidBody2D, Sprite, UITransform, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    @property({
        type:Node,
        tooltip:"Land"
    })
    private land:Node;
    @property({
        type:Node
    })
    private goblin:Node;

    @property({ 
        type: CCInteger,
        tooltip: 'Speed Spin' 
    })
    private speed: number = 2;

    @property({
        type:CCInteger,
        tooltip: 'Direction Value'
    })
    private direction:number=1;

    @property(Node)
    private startPoint: Node = null;

    @property(Node)
    private endPoint: Node = null;

    @property(Sprite)
    private ropeSprite: Sprite;

    @property(Prefab)
    private Enemy: Prefab;
    @property(Node)
    private Canvas: Node;

    @property(Camera)
    private Camerafl:Camera;

    private checkRun:boolean=false;
    private checkRotation:boolean=false;
    private rotationSpeed:number=110;
    private rotationSpeedRoblin=1.97;
    private currentRotation = 0;
    private EnemyNode:Node;
    
    start() {
        input.on(Input.EventType.TOUCH_START,this.controlStart,this);
        input.on(Input.EventType.TOUCH_END,this.controlEnd,this);
        this.EnemyNode = instantiate(this.Enemy);
        this.Canvas.addChild(this.EnemyNode);
        this.EnemyNode.setPosition(this.RandomPosition());
        this.EnemyNode.getComponent(UITransform).width=this.RandomSize();
        const collider1 = this.goblin.getComponent(Collider2D);
        if (collider1) {
            collider1.on(Contact2DType.BEGIN_CONTACT, this.onCollisionTank, this);
        }
    }

    update(deltaTime: number) {
        this.ropeSprite.node.position=new Vec3(this.land.position.x,this.land.position.y)
        const startPos = this.startPoint.getPosition();
        const endPos = this.endPoint.getPosition();
        const distance = Vec3.distance(startPos, endPos);
        this.ropeSprite.getComponent(UITransform).width = distance;
        if(this.checkRun)
        {
            this.land.position=new Vec3(this.land.position.x+1,this.land.position.y,0);
            this.EnemyNode.position=new Vec3(this.EnemyNode.position.x+1,this.EnemyNode.position.y,0);
        }
        if (this.checkRotation) {
            const rotationAmount = this.rotationSpeed * deltaTime;
            this.currentRotation += rotationAmount;
            if (this.currentRotation >= 360) {
                this.currentRotation -= 360;
            } else if (this.currentRotation < 0) {
                this.currentRotation += 360;
            }
            this.ropeSprite.node.setRotationFromEuler(0, 0, this.currentRotation);
            const rotationCenter = new Vec3(this.land.position);
            const currentPosition = this.goblin.position;
            const toCurrentPosition = currentPosition.subtract(rotationCenter);
            const currentAngle = Math.atan2(toCurrentPosition.y, toCurrentPosition.x);
            const newAngle = currentAngle + deltaTime * this.rotationSpeedRoblin;
            const newPosition = new Vec3(
                rotationCenter.x + Math.cos(newAngle) * toCurrentPosition.length(),
                rotationCenter.y + Math.sin(newAngle) * toCurrentPosition.length()
            );
            this.goblin.position = newPosition;
            this.goblin.getComponent(Collider2D).apply();
            this.Camerafl.node.position=new Vec3(this.Camerafl.node.position.x,this.goblin.position.y);
        }
        if(this.currentRotation>=200)
        {
            if(!this.EnemyNode.getComponent(BoxCollider2D))
            {
                const EnemyCol=this.EnemyNode.addComponent(BoxCollider2D);
                EnemyCol.tag=1;
                EnemyCol.size.width=this.EnemyNode.getComponent(UITransform).width;
                EnemyCol.size.height=30;
            }
        }
        if(this.currentRotation>=220)
        {
            this.checkRotation=false;
            this.ropeSprite.node.active=false;
            this.goblin.getComponent(RigidBody2D).gravityScale=1;
           
        }
    }
        
    private controlStart():void{
       this.checkRun=true
    }

    private controlEnd():void{
        this.checkRun=false;
        this.checkRotation=true;
    }

    private RandomPosition(): Vec3 {
        const minX = -27; 
        const maxX = 220;
        const minY = -160;
        const maxY = -100;
        const randomX = Math.random() * (maxX - minX) + minX;
        const randomY = Math.random() * (maxY - minY) + minY;
        return new Vec3(randomX,randomY);
    }

    private RandomSize(): number {
        const minSize = 40;  
        const maxSize = 100; 
        const randomSize = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
        return randomSize;
    }

    private onCollisionTank(selfCollider: Collider2D,otherCollider: Collider2D,contact: IPhysics2DContact): void {
        if(otherCollider.tag===1)
        {
            this.goblin.getComponent(RigidBody2D).gravityScale=0;
            console.log("t")
        }
    }
}
