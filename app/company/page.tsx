'use client'
import CompanyService from "@/services/CompanyService";
import { useState, useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table";
import Link from "next/link";
import { Company } from "@/interfaces/company.interface";
import Navbar from "@/components/navbar";

const CompanyPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);

    const updateAll = async () => {
        const fetchedCompanies = (await CompanyService.getCompanies()).data;
        setCompanies(fetchedCompanies);
    }

  useEffect(() => {
    updateAll();
  }, []);

  const handleEdit = (id: string) => {
  };

  const handleDelete = (id: string) => {
  };

  return (
    <>
    <Navbar />
    <main className="flex min-h-screen flex-col items-center gap-5 p-24">
      <h1 className="text-2xl font-bold">Compañías</h1>
      <Link href="/company/create" className={buttonVariants({ variant: "default" })}>Crear Compañía</Link>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {companies.map(company => (
            <TableRow key={company.id}>
              <TableCell>{company.id}</TableCell>
              <TableCell>{company.name}</TableCell>
              <TableCell>
                <button onClick={() => handleEdit(company.id)} className={buttonVariants({ variant: "default" })}>Editar</button>
                <button onClick={() => handleDelete(company.id)} className={buttonVariants({ variant: "destructive" })}>Eliminar</button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
    </>
  );
};

export default CompanyPage;
