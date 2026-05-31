export class UserInfo {
    id!: number;
    name!: string;
    email!: string;
    rolName!: string;
}

export class GetUsersDto {
    users!: UserInfo[] | null;

    totalUsers!: number;
    
    totalPages!: number;
}
