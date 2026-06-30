import { Request, Response, NextFunction } from "express"
import { AController } from "./AController"
import { CharacterService } from "@services/character.service"

export class CharacterController extends AController {
    constructor(private readonly characterService: CharacterService) {
        super()
        this.router.get("/",    this.list)
        this.router.get("/:id", this.getById)
    }

    private list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const characters = await this.characterService.getAllCharacters()
            res.json(characters)
        } catch (error) {
            next(error)
        }
    }

    private getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const character = await this.characterService.getCharacterById(req.params.id)
            res.json(character)
        } catch (error) {
            next(error)
        }
    }
}
