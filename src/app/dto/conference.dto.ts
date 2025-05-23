import { IsDateString, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateConferenceDTO {
    @IsString()
    @IsNotEmpty()
    title: string

    @IsNumber()
    @IsNotEmpty()
    seats: number

    @IsDateString()
    @IsNotEmpty()
    startDate: Date

    @IsDateString()
    @IsNotEmpty()
    endDate: Date
}

export class ChangeSeatsDTO {
    @IsNotEmpty()
    @IsNumber()
    seats: number
}

export class ChangeDatesDTO {
    @IsDateString()
    @IsNotEmpty()
    startDate: Date

    @IsDateString()
    @IsNotEmpty()
    endDate: Date
}