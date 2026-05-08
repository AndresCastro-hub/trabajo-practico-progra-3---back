export class CreateUserDto {
  name!: string;

  email!: string;

  passwordHashed!: string;

  rolId!: number;

  fechaCreacion!: Date;
}
