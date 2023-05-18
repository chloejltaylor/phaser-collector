import Phaser from '../lib/phaser.js'
import CollectableA from '../game/CollectableA.js'
import CollectableB from '../game/CollectableB.js'


export default class Game extends Phaser.Scene
{
    scenery
    player
    collectables
    decoys
    roaddashrtight
    roaddashesleft
    roaddashesright
    activatemovement = false
    numberofbounces = 0
    collectablesCollected = 0
    collectablesCollectedText
    difficultyfactor = 1
    iscollected=false
    isStruck=false
    startingXCoords=[600,700,800]
    itemTypes=['collectable','decoy']


    constructor() 
    {
    super('game')
    }

    init()
    {
        this.collectablesCollected = 0
        this.difficultyfactor = 1
    }

    preload()
    {
        this.load.image('background', './src/assets/Background/road-bg.png')
        this.load.image('sky-rectangle', './src/assets/Background/sky-rectangle.png')
        this.load.image('road-dash-l', './src/assets/Background/road-dash-l.png')
        this.load.image('road-dash-r', './src/assets/Background/road-dash-r.png')
        this.load.image('tree1', './src/assets/Background/tree1.png')
        this.load.image('tree2', './src/assets/Background/tree2.png')
        this.load.image('scenery', './src/assets/Environment/ground.png')
        this.load.image('player', './src/assets/Players/player.png')
        this.load.image('player-jump', './src/assets/Players/player-jump.png')
        this.load.image('player-hurt-right', './src/assets/Players/player-hurt-right.png')
        this.load.image('player-hurt-left', './src/assets/Players/player-hurt-left.png')
        this.load.image('player-hurt-middle', './src/assets/Players/player-hurt-middle.png')
        this.load.image('player-zoom', './src/assets/Players/player-zoom.png')
        this.load.image('player-dead', './src/assets/Players/player-dead.png')
        this.load.image('star-death','./src/assets/Items/star-death-right.png' )
        this.load.image('collectable', './src/assets/Items/star.png')
        this.load.image('star2', './src/assets/Items/star-bad.png')
        this.load.spritesheet("decoy", "./src/assets/Items/star-bad-spritesheet.png", {
            frameWidth: 76,
            frameHeight: 74
        });
        this.load.audio('boing', './src/assets/Sounds/cartoonboing.mp3')
        this.load.audio('pop', './src/assets/Sounds/cartoonbubblepop.mp3')


    }

    create()
    {

        
        this.add.image(700, 300, 'background')

        const roaddashesleft = this.physics.add.group()
        this.roaddash1eft1 = roaddashesleft.create(450, 200, 'road-dash-l').setVelocity(-110, 100)
        this.roaddash1eft2 = roaddashesleft.create(240, 400, 'road-dash-l').setVelocity(-110, 100)
        this.roaddash1eft3 = roaddashesleft.create(10, 600, 'road-dash-l').setVelocity(-110, 100)
        const roaddashesright = this.physics.add.group()
        this.roaddashright1 = roaddashesright.create(950, 200, 'road-dash-r').setVelocity(110, 100)
        this.roaddashright2 = roaddashesright.create(1160, 400, 'road-dash-r').setVelocity(110, 100)
        this.roaddashright3 = roaddashesright.create(1370, 600, 'road-dash-r').setVelocity(110, 100)

        const treesleft = this.physics.add.group()
        this.treeleft1 = treesleft.create(250, 200, 'tree1').setVelocity(-130, 100)
        this.treeleft2 = treesleft.create(140, 400, 'tree2').setVelocity(-130, 100)
        const treesright = this.physics.add.group()
        this.treeright1 = treesright.create(1200, 200, 'tree1').setVelocity(130, 100)
        this.treeright2 = treesright.create(1300, 400, 'tree2').setVelocity(130, 100)

        this.add.image(700, 70, 'sky-rectangle')
        // Scenery creation 
        this.scenery = this.physics.add.staticGroup()
        const sceneries = this.scenery.getChildren()
        for(let i=0; i<sceneries.length; i++){
            sceneries[i].setVelocityX(-20)
        }


    // Create player

        this.player = this.physics.add.sprite(700, 500, 'player').setScale(0.8)

    // Create collectables
        this.collectables = this.physics.add.group({
            classType: CollectableA
        })

        this.time.addEvent({
            delay: 2000,   
            callback: 
            function addItem() {
            const y = 150
            let randomNo = Phaser.Math.Between(0, 2)            
            let randomNo2 = Phaser.Math.Between(0, 1)      
            const x = this.startingXCoords[randomNo]
            let collectionTypes=[this.collectables, this.decoys]
            const item = collectionTypes[randomNo2].get(x, y, this.itemTypes[randomNo2]).setScale(0.5)
            item.setActive(true)
            item.setVisible(true)
            this.physics.world.enable(item)
            item.setVelocityY(60)
            item.setAccelerationY(50)
            if(randomNo==0) {
                item.setVelocityX(-100)
            } else 
            if(randomNo==2) {
                item.setVelocityX(100)
            } else {
                item.setVelocityX(0)
            }

            return item
            },   
            // callback: addItem('star', this.collectables),
            callbackScope: this,
            loop: true
        })

        // this.addItem('star', this.collectables)
        this.physics.add.overlap(this.collectables, this.player, this.handleCollect, undefined, this)

    // Create display keeping count

        const style = { color: '#fff', fontSize: 70 }
        this.collectablesCollectedText = this.add.text(240,10,'0', style).setScrollFactor(0).setOrigin(0.5, 0)



    // Create decoys
        this.decoys = this.physics.add.group({
            classType: CollectableB
        }

        )

        this.anims.create({
            key: "decoyflash",
            frames: this.anims.generateFrameNumbers("decoy", {
                start: 0,
                end: 1
            }),
            frameRate: 3,
            yoyo: true,
            repeat: -1
        });

        this.physics.add.overlap(this.decoys, this.player, this.handleHitDecoy, undefined, this)    
        // this.addItem('decoy', this.decoys)

    }




    update()
    {
        // scenery getting larger in foreground

        this.treeleft1.setScale(this.treeleft1.y*0.002)
        this.treeleft2.setScale(this.treeleft2.y*0.002)
        this.treeright1.setScale(this.treeleft1.y*0.002)
        this.treeright2.setScale(this.treeleft2.y*0.002)
        // this.roaddash1eft1.setScale(this.roaddash1eft1.y*0.002)
        // this.roaddash1eft2.setScale(this.roaddash1eft2.y*0.002)
        // this.roaddash1eft3.setScale(this.roaddash1eft3.y*0.002)
        // this.roaddashright1.setScale(this.roaddashright1.y*0.002)
        // this.roaddashright2.setScale(this.roaddashright2.y*0.002)
        // this.roaddashright3.setScale(this.roaddashright3.y*0.002)
        this.collectables.scaleXY(0.004, 0.004)
        this.decoys.scaleXY(0.004, 0.004)

        // scenery reuse code 

        this.recyclescenery(this.roaddash1eft1, 560, 100, false)
        this.recyclescenery(this.roaddash1eft2, 560, 100, false)
        this.recyclescenery(this.roaddash1eft3, 560, 100, false)
        this.recyclescenery(this.roaddashright1, 840, 100, false)
        this.recyclescenery(this.roaddashright2, 840, 100, false)
        this.recyclescenery(this.roaddashright3, 840, 100, false)
        this.recyclescenery(this.treeleft1, 400, 100, true)
        this.recyclescenery(this.treeleft2, 400, 100, true)
        this.recyclescenery(this.treeright1, 950, 100, true)
        this.recyclescenery(this.treeright2, 950, 100, true)

        // add new collectables

        // console.log(this.collectables)

        // const collectableItem = this.collectables.getChildren()[0]
        //     if (collectableItem.y >= 1200 || this.iscollected) {
        //         // console.log("RECYCLE")
        //         this.collectables.killAndHide(collectableItem)
        //         this.physics.world.disableBody(collectableItem.body)
        //         let randomNo2 = Phaser.Math.Between(0, 1)
        //         console.log("randomNo2: "+ randomNo2)
        //         let collectionTypes=[this.collectables, this.decoys]
        //         // this.addItem(this.itemTypes[randomNo2], collectionTypes[randomNo2])
        //         this.addItem('star', this.collectables)
        //         collectableItem.setAccelerationY(50)
        //         collectableItem.setScale(1)
        //         this.iscollected = false
        //     }

        

        // this.collectables.children.iterate(collectable => {
        //     if (collectable.y >= 1200 || this.iscollected) {
        //         this.collectables.killAndHide(collectable)
        //         this.physics.world.disableBody(collectable.body)
        //         let randomNo2 = Phaser.Math.Between(0, 1)
        //         console.log("randomNo2: "+ randomNo2)
        //         let collectionTypes=[this.collectables, this.decoys]
        //         this.addItem(this.itemTypes[randomNo2], collectionTypes[randomNo2])
        //         collectable.setAccelerationY(50)
        //         collectable.setScale(1)
        //         this.iscollected = false
        //     }

        // })

         // add new decoys

        // this.decoys.children.iterate(decoy => {
        //     if (decoy.y >= 1200 || this.isStruck) {
        //         this.decoys.killAndHide(decoy)
        //         this.physics.world.disableBody(decoy.body)
        //         let randomNo3 = Phaser.Math.Between(0, 1)
        //         console.log("randomNo3: "+ randomNo3)
        //         let collectionTypes=[this.collectables, this.decoys]
        //         this.addItem(this.itemTypes[randomNo3], collectionTypes[randomNo3])
        //         // this.addItem('decoy', this.decoys)
        //         decoy.setAccelerationY(50)
        //         decoy.setScale(0.5)
        //         this.isStruck = false
        //     }

        // })
            


        // player movement code
        if(this.input.activePointer.isDown){
            this.activatemovement = true
        } 

                if(this.activatemovement && this.input.activePointer.position.x < 500) {
                    if(Math.abs(this.player.x - 300) <= 10 ) {
                        this.player.x = 300
                        this.activatemovement = false
                    } else if(this.player.x > 300) {
                        this.player.x -= 20
                    }
            console.log(this.input.activePointer.position.x)

        } 
        else
        if(this.activatemovement && this.input.activePointer.position.x > 500 && this.input.activePointer.position.x <900) {
            if(Math.abs(this.player.x - 700) <= 10 ) {
                this.player.x = 700
                this.activatemovement = false
            } else if(this.player.x > 700) {
                this.player.x -= 20
            } else if(this.player.x < 700) {
                this.player.x += 20
            } 

        } 
        else
        if(this.activatemovement && this.input.activePointer.position.x > 900) {
            if(Math.abs(this.player.x - 1100) <= 10 ) {
                this.player.x = 1100
                this.activatemovement = false
            } else if(this.player.x > 1100) {
                this.player.x -= 20
            } else if(this.player.x < 1100) {
                this.player.x += 20
            } 

        } 

        

    }





    handleCollect(player, collectable)
    {
        this.collectables.killAndHide(collectable)
        this.physics.world.disableBody(collectable.body)
        this.sound.play('pop')
        this.collectablesCollected ++
        this.collectablesCollectedText.text = this.collectablesCollected
        this.iscollected = true
        this.tweens.add({
            targets: player, //your image that must spin
            scale: 1.15, //rotation value must be radian
            duration: 200, //duration is in milliseconds
            yoyo: true
        });
        if(this.collectablesCollected==10){
            this.timedEvent = this.time.delayedCall(2000, this.playGameOver, [], this)
        }

    }

    handleHitDecoy(player,decoy){
        this.decoys.killAndHide(decoy)
        this.physics.world.disableBody(decoy.body)
        this.sound.play('boing')
        this.isStruck = true
        this.tweens.add({
            targets: player, //your image that must spin
            rotation: Math.PI * 2, //rotation value must be radian
            duration: 500 //duration is in milliseconds
        });
    }

    addItem(type, collection) {
    
        const y = 150
        let randomNo = Phaser.Math.Between(0, 2)                
        const x = this.startingXCoords[randomNo]
        const item = collection.get(x, y, type).setScale(0.5)
        item.setActive(true)
        item.setVisible(true)
        // this.add.existing(item)
        // item.body.setSize(item.width, item.height)
        this.physics.world.enable(item)
        if(type=='decoy'){item.anims.play("decoyflash")}
        item.setVelocityY(60)
        item.setAccelerationY(50)
        if(randomNo==0) {
            item.setVelocityX(-100)
        } else 
        if(randomNo==2) {
            item.setVelocityX(100)
        } else {
            item.setVelocityX(0)
        }

        return item
        }

    // scenery reuse code 

    recyclescenery(scenery, x, y, scales) {
        if(scenery.y>650){
            if(scales){scenery.setScale(0)}
        }
        if(scenery.y>700){
            scenery.x = x
            scenery.y = y
        }
        
    }

    
    playGameOver() {
        this.scene.start('game-over')
    }
}


