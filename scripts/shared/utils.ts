import crypto from "crypto"

export const generateRandomHash = (length: number = 16) => {
    return crypto.randomBytes(length).toString("hex");
}

export const parseImagesFromRoles = (): string[] => {
    // Vite позволяет импортировать файлы по паттерну
    const modules = import.meta.glob('/public/roles/**/*.{png,jpg,jpeg,gif,webp,svg}', {
        eager: true,
        as: 'url'
    })

    // Преобразуем в список путей
    const imagePaths = Object.keys(modules).map(path =>
        path.replace('/public', '') // убираем /public из пути
    )

    return imagePaths
}