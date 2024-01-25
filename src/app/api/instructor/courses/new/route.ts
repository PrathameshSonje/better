import { connectToDatabase } from "@/lib/dbconfig";
import { Admin } from "@/models/adminModel";
import { Course } from "@/models/courseModel";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const req = await request.json();
        let existingAdmin;

        try {
            existingAdmin = await Admin.findById(req.admin_id);
        } catch (error) {
            return NextResponse.json({
                msg: "Admin not found in the database"
            });
        }

        if (!existingAdmin) {
            return NextResponse.json({
                msg: "Admin not found in the database"
            });
        }

        const course = new Course({
            title: req.title,
            description: req.description,
            image: req.image,
            price: req.price,
            admin_id: req.admin_id
        });

        const session = await mongoose.startSession();

        try {
            session.startTransaction();
            await course.save({ session });
            existingAdmin.courses.push(course);
            await existingAdmin.save({ session });
            await session.commitTransaction();
        } catch (error) {
            console.error("Transaction failed:", error);
            await session.abortTransaction();
            return NextResponse.json({
                msg: "Error during transaction. Course not saved."
            });
        }

        return NextResponse.json({
            msg: "Course saved successfully"
        })
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({
            msg: "Unexpected error occurred."
        });
    }
}
