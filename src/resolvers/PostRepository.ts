import { Post } from "src/domain/entities/Post";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import GraphQlContext from "./GraphQlContext";

@Resolver()
export default class PostRepository {
    @Query(() => [Post])
    async posts(@Ctx() ctx: GraphQlContext): Promise<Post[]> {
        return await ctx.Orm.em.getRepository(Post).find({})
    }

    @Query(() => Post, { nullable: true })
    async post(@Arg("id") id: number, @Ctx() ctx: GraphQlContext): Promise<Post | null> {
        return await ctx.Orm.em.getRepository(Post).findOne({ id })
    }

    @Mutation(() => Post, { nullable: true })
    async create(@Arg("title") title: string, @Ctx() ctx: GraphQlContext): Promise<Post | null> {
        const repository = ctx.Orm.em.getRepository(Post)
        const post = repository.create({ title })

        if(!post.Validate().IsValid){
            return null
        }

        await repository.persist(post).flush()
        return post
    }

    @Mutation(() => Post, { nullable: true })
    async update(@Arg("id") id: number, @Arg("title") title: string, @Ctx() ctx: GraphQlContext): Promise<Post | null> {
        const post = await ctx.Orm.em.getRepository(Post).findOne({ id })
        if(!post){
            return null
        }

        post.title = title

        if(!post.Validate().IsValid){
            return null
        }

        await ctx.Orm.em.persistAndFlush(post)
        return post
    }

    @Mutation(() => Boolean)
    async delete(@Arg("id") id: number, @Ctx() ctx: GraphQlContext): Promise<boolean> {
        try {
            await ctx.Orm.em.getRepository(Post).nativeDelete({ id })
            return true
        } catch (error) {
            return false
        }
    }
}
