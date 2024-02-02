import { connectToDatabase } from "@/lib/dbconfig";
import { Admin } from "@/models/adminModel";
import { Course } from "@/models/courseModel";
import { NextRequest, NextResponse } from "next/server";
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();
        const headerList = headers();
        const admin_id = headerList.get('admin_id');
        const admin = await Admin.findById(admin_id);
        if (!admin) {
            // Return a proper response to the client if admin is not found
            return NextResponse.json({
                error: 'Admin not found'
            });
        }
        const courses = await Course.find({
            admin_id: admin_id
        })
        // Return the courses as a response
        return NextResponse.json(courses);
    } catch (error) {
        console.error('Error retrieving courses by admin ID:', error);
        return NextResponse.json({
            error: 'Internal Server Error'
        }, { status: 500 });
    }
}