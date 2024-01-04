import * as fs from 'fs'
import * as path from 'path'
import { getFileSize } from './node_gm'

export interface IFile {
    path: string
    fullPath: string
    size: number

}

export function getFilesInDirectory(rootDir, directory, excludes: string[] = ['node_modules', ".git", "dist"]): IFile[] {
    let files = [] as IFile[]

    fs.readdirSync(directory).forEach(file => {
        const absolutePath = path.join(directory, file)
        if (fs.statSync(absolutePath).isDirectory()) {
            if (!excludes.includes(file)) {
                files = files.concat(getFilesInDirectory(rootDir, absolutePath))
            }
        } else {
            files.push({
                path: path.relative(rootDir, absolutePath),
                fullPath: path.resolve(absolutePath),
                size: getFileSize(absolutePath) || 0,
            })
        }
    })

    return files
}
