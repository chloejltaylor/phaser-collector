// import Phaser from './lib/phaser.js'
import Phaser from './lib/phaser.js'
import Game from './scenes/game.js'
import GameOver from './scenes/gameOver.js'

export default new Phaser.Game({
type: Phaser.AUTO,
width: 1400,
height: 600,
scene: [Game, GameOver],
physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
}
})