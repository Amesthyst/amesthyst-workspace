import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { validateHRAccess } from "@/lib/auth/validateHRAccess";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await validateHRAccess();

  if (!authUser) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const { id } = await params;

  const department =
    await prisma.department.findUnique({
      where: {
        id,
      },

      include: {
        employees: {
          include: {
            user: true,

            department: {
              select: {
                id: true,
                name: true,
              },
            },

            payroll: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

  if (!department) {
    return NextResponse.json(
      {
        error: "Department not found",
      },
      {
        status: 404,
      }
    );
  }

  const totalPayroll =
    department.employees.reduce(
      (sum, employee) =>
        sum +
        (employee.payroll?.[0]
          ?.totalSalary ?? 0),
      0
    );

  const activeEmployees =
    department.employees.filter(
      (e) => e.status === "ACTIVE"
    ).length;

  const onLeaveEmployees =
    department.employees.filter(
      (e) => e.status === "ON_LEAVE"
    ).length;

  const resignedEmployees =
    department.employees.filter(
      (e) => e.status === "RESIGNED"
    ).length;

  const terminatedEmployees =
    department.employees.filter(
      (e) => e.status === "TERMINATED"
    ).length;

  return NextResponse.json({
    id: department.id,
    companyId: department.companyId,
    name: department.name,
    description:
      department.description,

    employees: department.employees,

    stats: {
      employees:
        department.employees.length,

      activeEmployees,

      onLeaveEmployees,

      resignedEmployees,

      terminatedEmployees,

      payrollCost:
        totalPayroll,
    },
  });
}

export async function DELETE(
    req: Request,
    {
      params,
    }: {
      params: Promise<{ id: string }>;
    }
  ) {
    const authUser = await validateHRAccess();
  
    if (!authUser) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
  
    const { id } = await params;
  
    const department =
      await prisma.department.findUnique({
        where: {
          id,
        },
        include: {
          employees: true,
        },
      });
  
    if (!department) {
      return NextResponse.json(
        {
          error: "Department not found",
        },
        {
          status: 404,
        }
      );
    }
  
    await prisma.employee.updateMany({
      where: {
        departmentId: id,
      },
      data: {
        departmentId: null,
      },
    });
  
    await prisma.department.delete({
      where: {
        id,
      },
    });
  
    return NextResponse.json({
      success: true,
      message:
        "Department deleted successfully",
    });
  }