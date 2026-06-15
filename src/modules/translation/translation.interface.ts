export const TRANSLATION_SERVICE = 'TRANSLATION_SERVICE'

export interface ITranslation{
    traducir(nombreEspanol: string) : Promise<string>
}